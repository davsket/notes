



function saveContent(){
	localStorage.setItem(notesPrefix+localStorage.getItem(lastPrefix), textarea.document.body.innerHTML);
	// if(clearTextarea){
	// 	clearTextarea = false;
	// 	textarea.document.body.innerHTML = cleanStylesAndSpaces(textarea.document.body.innerHTML);
	// }
}

// textarea.addEventListener('keyup', saveContent);
// textarea.addEventListener('paste', function(evt){
// 	clearTextarea = true;
// 	saveContent();
// 	clearTextarea = true;
// });

function cancel(evt){
	evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
	return false;
}
textarea.addEventListener('dragenter', cancel);
textarea.addEventListener('dragover', cancel);

textarea.addEventListener('drop', function(evt){
	// evt.preventDefault();
	//console.log(evt.dataTransfer);

	
	if (evt.dataTransfer.types){
		//console.log(evt.dataTransfer.types);
	    [].forEach.call(evt.dataTransfer.types, function (type) {
	   //  	if(type == 'text/html'){
	   //  		evt.target.innerHTML += cleanStylesAndSpaces(evt.dataTransfer.getData(type));
	   //  	}
	   //  	else if(type == 'Files'){
	   //  		var file = evt.dataTransfer.files[0],
				// 	reader = new FileReader();
				// if(file.type.match(/image/)){
				// 	reader.onload = function (event) {
				// 		evt.target.innerHTML += '<img src="'+event.target.result+'" />';
				// 	};
				// }
				// reader.readAsDataURL(file);
				// soma = file;
	   //  	}
			console.log(type);
			if(type == 'Files'){
	    		var file = evt.dataTransfer.files[0],
					reader = new FileReader();
				console.log(file.type);
				console.log(file);
				reader.onload = function (event) {
					console.log(event.target.result);
				};
				// reader.readAsDataURL(file);
				reader.readAsText(file);
				console.log('reading..');
	    	}
	    });
	    
	}
	// else {
	// 	evt.target.innerHTML = evt.dataTransfer.getData('Text');
	// }

	// return false;
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
	if(tn == 'LI' && evt.target.getElementsByClassName('txt').length){
		loadNote(evt.target.getElementsByClassName('txt')[0].innerHTML);
	}
	else if(tn == 'SPAN' && !/option/.test(evt.target.className)){
		loadNote(evt.target.parentElement.getElementsByClassName('txt')[0].innerHTML);
	}
	else if(tn == 'SPAN' && /delete/.test(evt.target.className)){
		name = evt.target.parentElement.getElementsByClassName('txt')[0].innerHTML;
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
			oldname = text.innerHTML;
		modal.prompt('New name:', (function(text, oldname){
			return function(name){
				if(!name){
					return false;
				} 
				else{
					text.innerHTML = name;
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
	resizeIframe();
}

function createNote(name, ignore_new_item){
	lists = localStorage.getItemJSON(listsPrefix);
	if(!lists){
		lists = [];
	}
	for(var i=0; i<lists.length; i++){
		if(lists[i] == name){
			alert('Already extists anote with the name: '+name+'. Opening note '+name+'.');
			loadNote(name);
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

function cleanStylesAndSpaces(val){
	return val.replace(/(style=(\")[^\"]*(\"))|(style=(\')[^\']*(\'))|^((\s)*(&nbsp;)*)/g,'').replace(/\s+/,' ');
}

function notifySaved(){
	var status = document.getElementById('status');
	status.innerHTML = 'note saved as: '+localStorage.getItem(lastPrefix);
	status.className = 'show';
	setTimeout(function(){
		status.className = 'show hide';
	}, 200);
}