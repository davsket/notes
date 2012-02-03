
function saveContent(){
	localStorage.setItem(notesPrefix+localStorage.getItem(lastPrefix), textarea.document.body.innerHTML);
}

textarea.addEventListener('paste', function(evt){
	saveContent();
});

function cancel(evt){
	evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
	return false;
}
textarea.addEventListener('dragenter', cancel);
textarea.addEventListener('dragover', cancel);

textarea.addEventListener('drop', function(evt){
	evt.preventDefault();
	if (evt.dataTransfer.types){
		var type = evt.dataTransfer.types[0];
		if(type == 'Files'){
    		var file = evt.dataTransfer.files[0],
				reader = new FileReader();
			console.log(file.type);
			if(!file.type || file.type.match(/text/)){
				modal.confirm('Do you want to load this file as a new note with name: '+file.name+'?', function(res){
					reader.onload = function (event) {
						var result = event.target.result;
						if(!file.type || !file.type.match(/html/)){
							result = result.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>').replace(/\s/g,'&nbsp;');
						}
						if(res){
							createNote(file.name);
							localStorage.setItem(notesPrefix+file.name,result);
							loadNote(file.name);
						}else{
							textarea.document.body.innerHTML+=result;
							saveContent();
						}
					};
					reader.readAsText(file);
				});
			}
			else if(file.type.match(/image/)){
				reader.onload = function (event) {
						var result = event.target.result;
						textarea.document.body.innerHTML+='<img src="'+result+'"/>';
						saveContent();
					};
				reader.readAsDataURL(file);
			}
    	}
    	else{
    		textarea.document.execCommand('InsertHTML', false, evt.dataTransfer.getData(type));
    	}
	}
	else {
		textarea.document.execCommand('InsertHTML', false, evt.dataTransfer.getData(type));
	}
	return false;
});

newnote.addEventListener('click', function(evt){
	modal.prompt('New note name:', function(name){
		if(name){
			createNote(name);
			loadNote(name);
		}
	});
});

menulist.addEventListener('click', function(evt){
	var tn = evt.target.tagName, name, bool;
	if(tn == 'LI' && evt.target.id != 'newnote'){
		loadNote(evt.target.dataset.name);
	}
	else if(tn == 'SPAN' && !/option/.test(evt.target.className)){
		loadNote(evt.target.parentElement.dataset.name);
	}
	else if(tn == 'SPAN' && /delete/.test(evt.target.className)){
		name = evt.target.parentElement.dataset.name;
		modal.confirm('Are you sure you want to delete the note: '+name+'?', function(bool){
			if(!bool){
				return false;
			} 
			else{
				menulist.removeChild(evt.target.parentElement);
				deleteNote(name);
			}
		});
		
	}
	else if(tn == 'SPAN' && /rename/.test(evt.target.className)){
		var text = evt.target.parentElement.getElementsByClassName('txt')[0],
			oldname = evt.target.parentElement.dataset.name;
		modal.prompt('New name:', (function(text, oldname){
			return function(name){
				if(!name){
					return false;
				} 
				else{
					text.innerHTML = name;
					evt.target.parentElement.dataset.name = name;
					localStorage.setItem(notesPrefix+name, localStorage.getItem(notesPrefix+oldname));
					newlists = localStorage.getItemJSON(listsPrefix);
					newlists.push(name);
					localStorage.setItem(listsPrefix, JSON.stringify(newlists));
					deleteNote(oldname);
					loadNote(name);
				}
			}
		})(text, oldname));
	}
});

function initialize(){
	var lists, i, list, length;
	lists = localStorage.getItemJSON(listsPrefix);
	if(!lists || lists.length == 0){
		loadNote();
	}
	else{
		for (i = 0; i < lists.length; i++) {
			list = lists[i];
			createMenuItem(list);
		}
		loadNote(localStorage.getItemJSON(lastPrefix));
	}
}
initialize();

function loadNote(noteName){
	if(!noteName){
		noteName = 'New note';
		createNote(noteName);
	}
	localStorage.setItem(lastPrefix, noteName);
	textarea.document.body.innerHTML = localStorage.getItemJSON(notesPrefix+noteName) || 'Write something...';

	//length = textarea.document.body.innerHTML.length;
	//textarea.scrollTop = textarea.scrollHeight;
	//textarea.setSelectionRange(length, length);
	textarea.document.body.focus();
	document.title = 'Editing ' + noteName;
	
	document.getElementById('textarea').style.height = 'auto';
}

function createNote(name, ignore_new_item){
	lists = localStorage.getItemJSON(listsPrefix);
	if(!lists){
		lists = [];
	}
	for(var i=0; i<lists.length; i++){
		if(lists[i] == name){
			modal.alert('Already extists anote with the name: '+name+'. Opening note '+name+'.', function(){
				loadNote(name);
			});
			return false;
		}
	}
	if(!ignore_new_item){
		createMenuItem(name);
	}
	lists.push(name)
	localStorage.setItem(listsPrefix,JSON.stringify(lists));
}

function createMenuItem(note){
		var el = document.createElement('li'), opc;
		//opc = note == 'New list' ? '' : '<span class="delete">&#10006;</span>';
		opc = '<span class="rename option">S</span><span class="delete option">&#10006;</span>';
		el.innerHTML = '<span class="txt">'+note+'</span>' + opc;
		el.dataset.name = note;
		el.draggable = true;
		menulist.insertBefore(el, newnote);
		applyDragHandlers(el);
}

function deleteNote(name){
	var lists = localStorage.getItemJSON(listsPrefix);
	for(var i=0; i<lists.length; i++){
		if(lists[i] == name){
			lists.splice(i,1);
		}
	}
	localStorage.setItem(listsPrefix, JSON.stringify(lists));
	localStorage.setItem(notesPrefix+name, '');
	localStorage.removeItem(notesPrefix+name);
	if(lists.length == 0){
		loadNote();
		return;
	}
	if(localStorage.getItem(lastPrefix) == name){
		loadNote(lists[0]);
		return;
	}
}

function notifySaved(){
	var status = document.getElementById('status');
	status.innerHTML = 'note saved as: '+localStorage.getItem(lastPrefix);
	status.className = 'show';
	setTimeout(function(){
		status.className = 'show hide';
	}, 200);
}