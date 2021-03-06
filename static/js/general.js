/************************************
 * General Script v 0.8
 ************************************/



/************************************
 * The Javascript prototype and 
 * window extension
 ************************************/

Element.prototype.hasClassName = function(name) {
  return new RegExp("(?:^|\\s+)" + name + "(?:\\s+|$)").test(this.className);
};
Element.prototype.addClassName = function(name) {
  if (!this.hasClassName(name)) {
    this.className = this.className ? [this.className, name].join(' ') : name;
  }
};
Element.prototype.removeClassName = function(name) {
  if (this.hasClassName(name)) {
    var c = this.className;
    this.className = c.replace(new RegExp("(?:^|\\s+)" + name + "(?:\\s+|$)", "g"), "");
  }
};
Storage.prototype.getItemJSON = function(item){
	var val = this.getItem(item)||'null';
	try{
		return JSON.parse(val);
	}catch(e){
		return val;
	}
};
NodeList.prototype.forEach = function(){
	return Array.prototype.forEach.apply(this, arguments);
};
window.getStyle = function(elem, styleProp){
	return elem.currentStyle ? elem.currentStyle[styleProp] : window.getComputedStyle(elem,null).getPropertyValue(styleProp);
};
window.$ = function (){
    return document.getElementById.apply(document, arguments)
}
window.$$ = function (){
    return document.querySelectorAll.apply(document, arguments)
}


/************************************
 * Global variables
 ************************************/

var 
	//The textarea iframe (it was originally a textarea)
	textarea = $('textarea'),
	//The menu list
	menulist = $('menulist'),
	//The new note button in the menu
	newnote = $('newnote'),
	//Title input
	titleInput = $$('#header .title')[0],
	//The DnD source element 
	dragSrcEl,
	//The app prefix for the notes list
	listsPrefix = 'notes/lists',
	//The app prefix for each note
	notesPrefix = 'notes/lists/',
	//The note prefix for the last/active note
	lastPrefix = 'notes/lastlist',
	//Last Note Name for perfomance optimization
	lastNoteName = localStorage.getItem(lastPrefix),
	//The modal used
	modal = new Modal(null, true),
	//Timeout for notifications
	timeOut,
	//Timeout for keyEvent
	timeOutKey,
	//Timeout for saveContent
	timeOutSave,
	menuAbout = $('about'),
	menuExportData = $('export_data'),
	menuImportData = $('import_data'),
	menuShortcuts = $('shortcuts'),
	sendByEmail = $('send_email'),
	welcomeNote = {name: "Welcome", content: "<div><br></div><div>\
	Hello, it looks like it's your first time here. Here are some tips about this application, \
	you can modify this note as you want:</div>\
	<blockquote style=\"margin: 0 0 0 40px; border: none; padding: 0px;\"><ol>\
	<li>It lets you apply to your notes styles like: <i>italic, </i><b>bold, </b><u>underline</u>, \
	all them <i><u><b>together</b></u></i>, and erase them, just by using key board short-cuts.</li>\
	<li>You can also make indentations, ordered and unordered lists, and tabs, just in the <i>same way</i>.</li>\
	<li>Your data keeps locally (this browser) and it's never gonna be stored in any server or elsewhere.</li>\
	<li>It lets you do: <b>undo</b> and <b>redo </b>your changes.</li>\
	<li>You can change the name of this note by editing the title directly or using the list... <i>(read next tip)</i></li>\
	<li>Te <b>four-squared</b> icon lets you acces to a list with all the notes you have. From there you can create new notes, \
	edit them and delete them.</li><li>The <b>lightning</b> icon lets you access to a list with all the shortcuts.</li>\
	<li>The <b>wheel</b> lets you access to all the configuration options, by the while just: copy your notes and import some notes.</li>\
	<li>The information, there I will put information about this app, like versioning and fixes/improvements.</li></ol></blockquote>"}
;


/************************************
 * Events listening
 ************************************/
//TITLE EVENTS
titleInput.addEventListener('keyup', titleKeyUpEvents);

//TEXTAREA EVENTS

//Paste event listening
textarea.addEventListener('paste', saveContent);

//DnD Canelable events
textarea.addEventListener('dragenter', cancelDnD);
textarea.addEventListener('dragover', cancelDnD);

//Drop event listening
textarea.addEventListener('drop', onDropEvent);

//Key events
textarea.contentDocument.addEventListener('keydown', textareaKeyDownEvents);
textarea.contentDocument.addEventListener('keyup', textareaKeyUpEvents);
document.addEventListener('keydown', keyUpDownEvents);
document.addEventListener('keyup', keyUpDownEvents);

//MENU EVENTS
newnote.addEventListener('click', onNewNote);
menulist.addEventListener('click', onMenuClick);
menuAbout.addEventListener('click', showAbout);
menuExportData.addEventListener('click', showData);
menuImportData.addEventListener('click', importData);
menuShortcuts.addEventListener('click', showShortcuts);
sendByEmail.addEventListener('click', sendEmail);



/************************************
 * FUNCTIONS DEFINITION
 ************************************/


/**
 * Initialize the application: loads a note and
 * constructs the menu list
 */
function initializeNotes(){
	var lists, i, list, length,
		menuItems = $$('#menulist li:not(#newnote)'),
		style, redirectContent, cssRules;
	lists = localStorage.getItemJSON(listsPrefix);

	//If there are no notes
	if(!lists || lists.length == 0){
		createNote(welcomeNote.name);
		localStorage.setItem(lastPrefix, welcomeNote.name);
		lastNoteName = welcomeNote.name;
		saveContent(welcomeNote.content);
		setTimeout(function(){
			loadNote(welcomeNote.name);
		},300);
	}
	else{
		//Create the menu list
		for (i = 0; i < lists.length; i++) {
			list = lists[i];
			createMenuItem(list);
		}
		//Loads the last note used
		loadNote(localStorage.getItemJSON(lastPrefix));
	}

	menuItems.forEach(applyDragHandlers);

	//Iframe initialization
	//Sets the iframe on design mode and focus it
	textarea.contentDocument.designMode = "on";
	textarea.contentDocument.body.focus();

	//Loads the styles
	style = textarea.contentDocument.createElement('style');
		// fonts = textarea.contentDocument.createElement('link');
		
	// fonts.setAttribute('href', 'http://fonts.googleapis.com/css?family=Droid+Sans');
	// fonts.setAttribute('rel', 'stylesheet');
	// fonts.setAttribute('type', 'text/css');
	//No cache in iframe
	cssRules = document.createTextNode('html,body,div,span,applet,object,iframe,h1,h2,h3,h4,h5,h6,p,blockquote,pre,\
		a,abbr,acronym,address,big,cite,code,del,dfn,em,img,ins,kbd,q,s,samp,small,strike,strong,sub,sup,tt,var,b,\
		u,i,center,dl,dt,dd,ol,ul,li,fieldset,form,label,legend,table,caption,tbody,tfoot,thead,tr,th,td,article,\
		aside,canvas,details,embed,figure,figcaption,footer,header,hgroup,menu,nav,output,ruby,section,summary,time,\
		mark,audio,video{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}body{\
		line-height:1}ol,ul{list-style:none}table{border-collapse:collapse;border-spacing:0}caption,th,td{text-align:left\
		;font-weight:normal;vertical-align:middle}q,blockquote{quotes:none}q:before,q:after,blockquote:before,block\
		quote:after{content:"";content:none}a img{border:none}article,aside,details,figcaption,figure,footer,header\
		,hgroup,menu,nav,section,summary{display:block} @font-face{font-family:fontnomas;src:url("http://notes.davsket.me/font/fontomas-webfont.eot");\
		src:url("http://notes.davsket.me/font/fontomas-webfont.eot?#iefix") format("embedded-opentype"), url("http://notes.davsket.me/font/fontomas-webfont.ttf") format("truetype");\
		font-weight:normal;font-style:normal} @font-face{font-family: DroidSans;src:url("http://notes.davsket.me/font/DroidSans-webfont.eot");\
		src:url("http://notes.davsket.me/font/DroidSans-webfont.eot?#iefix") format("embedded-opentype"), url("http://notes.davsket.me/font/DroidSans-webfont.woff")\
		format("woff"), url("http://notes.davsket.me/font/DroidSans-webfont.ttf") format("truetype");font-weight:normal;font-style:normal}\
		@font-face{font-family: DroidSans;src:url("http://notes.davsket.me/font/DroidSans-Bold-webfont.eot");src:url("http://notes.davsket.me/font/DroidSans-Bold-webfont.eot?#iefix")\
		format("embedded-opentype"), url("http://notes.davsket.me/font/DroidSans-Bold-webfont.woff") format("woff"), url("http://notes.davsket.me/font/DroidSans-Bold-webfont.ttf")\
		format("truetype");font-weight:bold;font-style:normal} @font-face{font-family:IcoMoon;src:url("http://notes.davsket.me/font/icomoon.eot");\
		src:url("http://notes.davsket.me/font/icomoon.eot?#iefix") format("embedded-opentype"), url("http://notes.davsket.me/font/icomoon.svg#IcoMoon") format("svg"), \
		url("http://notes.davsket.me/font/icomoon.woff") format("woff"), url("http://notes.davsket.me/font/icomoon.ttf") format("truetype");font-weight:normal;font-style:normal}\
		.icon-b:before,.icon-a:after{font-family:IcoMoon;content:attr(data-icon)} html::-webkit-scrollbar{display:none}\
		body{color:#555;font-family: DroidSans;font-size:18px !important;margin:0 auto;outline:none;padding:0;position:relative;\
		width:100%;z-index:1;min-height:100%;height:auto;line-height:1.6em;word-wrap:break-word;padding:3.65em 1.6em 1.6em \
		!important;background-image: -webkit-linear-gradient(#eeeeee 0.05em, transparent 0.05em) !important;background-size:100% 1.6em;\
		box-sizing:border-box !important}body img{display:block;max-height:100%;max-width:100%} *{font-family: DroidSans, sans-serif !important;\
		background:transparent !important;font-size:1em !important;color:#555 !important;padding:0 !important;\
		margin-right:0!important;margin-top:0!important;margin-bottom:0!important;border:none !important;font-weight:normal !important;\
		line-height:1.6em !important}strong,b{font-weight:bold !important}u{text-decoration:underline}i{font-style:italic}\
		ul{list-style:disc !important;list-style-position:inside !important}ul li{list-style:disc !important;list-style-position:inside\
		!important}ol{list-style:decimal !important;list-style-position:inside !important}ol li{list-style:decimal !important;\
		list-style-position:inside !important}');
	style.setAttribute('type', 'text/css');
	if(style.styleSheet)
    	style.styleSheet.cssText = cssRules.nodeValue;
	else style.appendChild(cssRules);

	// textarea.contentDocument.head.appendChild(fonts);
	textarea.contentDocument.head.appendChild(style);

	textarea.style.display = 'block';

	// console.log(localStorage.getItem('wasServed'));

	// //Go to new one :)
	// redirectContent = 
	// 	'<div class="about"><h1>Hello! we\'ve moved to notes.davsket.me!</h1>'+
	// 	'To move your notes to the new app just click the button:'+
	// 	'<form action="http://notes.davsket.me/load/" method="post">'+
	// 		'<input type="hidden" name="notes" value="'+
	// 		encodeURIComponent(getJSONData())+'" />'+
	// 		'<input type="submit" class="button" value="send my notes!" onclick="heWasServed()" />'+
	// 	'</form></div>';
	// modal.setClosable(true);
	// modal.setContent(redirectContent);
	// modal.show();
}

function heWasServed(){
	localStorage.setItem('wasServed','True');
}

/**
 * Creates a new note
 * 
 * @param {String} name
 * @param {Boolean} ignore_new_item If true is not created an entry in the menu list
 */
function createNote(name, ignore_new_item){
	var lists = localStorage.getItemJSON(listsPrefix), i;
	//If there are no list in the localStorage
	//then creates an empty one
	if(!lists){
		lists = [];
	}
	//Search across the list to see if the given name
	//already exists and open it
	if ((i = lists.indexOf(name)) != -1){
		modal.alert('Already extists anote with the name: '+name+'. Opening note '+name+'.', function(){
				loadNote(name);
			});
		return false;
	}
	//Else, if is a new item, creates the menu entry
	if(!ignore_new_item){
		createMenuItem(name);
	}
	//Adds the note to the notes list
	lists.push(name)

	localStorage.setItem(listsPrefix,JSON.stringify(lists));
}

/**
 * Loads a note
 *
 * @param {String} [noteName] if not given creates a welcome note.
 */
function loadNote(noteName, ignoreFocus){
	//If no name is given, creates a new one
	if(!noteName){
		// createNote(welcomeNote.name);
		// localStorage.getItemJSON(lastPrefix, welcomeNote.name);
		// saveContent(welcomeNote.content);
		console.log('damn')
	}
	//Then set this note as the actual
	localStorage.setItem(lastPrefix, noteName);
	lastNoteName = noteName;

	//Loads the content in the textarea iframe
	textarea.contentDocument.body.innerHTML = localStorage.getItemJSON(notesPrefix+noteName) || '';
	if(!ignoreFocus){
		//Focus the textarea body
		textarea.contentDocument.body.focus();
		//Sets the application title
		titleInput.value = noteName;
	}
	//And sets the browser title
	document.title = 'Editing ' + noteName;
	//Sets the textarea height to auto... FIXME?
	textarea.style.height = 'auto';
}

/**
 * Deletes a note by its name
 *
 * @param {String} name
 */
function deleteNote(name){
	var lists = localStorage.getItemJSON(listsPrefix), i;
	// If the name exists removes it from the array
	if ((i = lists.indexOf(name)) != -1){
		lists.splice(i,1);
	}
	//Saves the new list
	localStorage.setItem(listsPrefix, JSON.stringify(lists));
	//Removes the list content
	localStorage.removeItem(notesPrefix+name);
	//If the list is empty creates a new note
	if(lists.length == 0){
		createNote(welcomeNote.name);
		localStorage.setItem(lastPrefix, welcomeNote.name);
		lastNoteName = welcomeNote.name;
		saveContent(welcomeNote.content);
		setTimeout(function(){
			loadNote(welcomeNote.name);
		},300);
	}
	//Else, if the actual note is the deleted one
	//then open the first one
	else if(lastNoteName == name){
		loadNote(lists[0]);
	}
}

/**
 * Saves the content in the actual note
 */
function saveContent(content){
	if(content){
		textarea.contentDocument.body.innerHTML = content;
		console.log(textarea.contentDocument.body.innerHTML)
	}
	else{
		content = textarea.contentDocument.body.innerHTML;
	}
	//TEST
	clearTimeout(timeOutSave);
	timeOutSave = setTimeout((function(key, new_content){
		return function delayedTimeoutSave(){
			localStorage.setItem(key, new_content);
		}
	})(notesPrefix+lastNoteName, content), 200);
};

/**
 * Generates a modal prompting the new note name
 * and creates a new note with the given name
 */
function onNewNote(){
	modal.prompt('New note name:', function(name){
		if(name){
			createNote(name);
			loadNote(name);
		}
	});
};

/**
 * Evaluate any click made on the menu and
 * executes the related action.
 * This function works as an event delegated
 * listener.
 *
 * @param {Event} evt
 */
function onMenuClick(evt){
	var tagName = evt.target.tagName, name, bool
		elem = evt.target;
	//If the clicked element was a LI different to the
	//newnote element, then loads the given note
	if(tagName == 'LI' && elem != newnote){
		loadNote(evt.target.dataset.name);
	}
	//If its not a LI but an SPAN with classname 'option'
	//then is a action-less span, then loads the note via 
	//it's parent dataset
	else if(tagName == 'SPAN' && !elem.hasClassName('option')){
		loadNote(evt.target.parentElement.dataset.name);
	}
	//If is an SPAN with the 'delete' classname, then confirm
	//to delete the given note
	else if(tagName == 'SPAN' && elem.hasClassName('delete')){
		name = evt.target.parentElement.dataset.name;
		modal.confirm('Are you sure you want to delete the note: '+name+'?', function(bool){
			if(!bool){
				return false;
			} 
			else{
				//Don't forget to remove the note from the menu list.
				menulist.removeChild(evt.target.parentElement);
				//Remove the note from the model
				deleteNote(name);
			}
		});	
	}
	//If is an SPAN with the 'rename' classname, then prompt for
	//the new name..
	else if(tagName == 'SPAN' && elem.hasClassName('rename')){
		//The oldname is the name of the selected note, and
		//textNode is the element in the menu with the name.
		var parentNode = evt.target.parentElement,
			textNode = parentNode.getElementsByClassName('txt')[0],
			oldname = parentNode.dataset.name;
		modal.prompt('New name:', (function(textNode, oldname, parentNode){
			return function(name){
				if(!name || oldname == name){
					return false;
				} 
				//If a name is given 
				else{
					//Replace the menu node's HTML
					textNode.innerHTML = name;
					//Reset the parent node dataset
					parentNode.dataset.name = name;
					//Reset the title value
					titleInput.value = name;
					//Rename the local storage note name
					localStorage.setItem(notesPrefix+name, localStorage.getItem(notesPrefix+oldname));
					//Update the notes list
					newlists = localStorage.getItemJSON(listsPrefix);
					newlists.push(name);
					localStorage.setItem(listsPrefix, JSON.stringify(newlists));
					//Deletes the old one
					deleteNote(oldname);
					//Load this note (sets this note as actual)
					loadNote(name);
				}
			}
		})(textNode, oldname, parentNode));
	}

	hideMenu();
};

/**
 * Creates a new entry in the Menu
 *
 * @param {String} name
 */
function createMenuItem(name){
		var el = document.createElement('li'), opc;
		// S is the char for the edit icon in the symbols font
		opc = '<span class="rename option">J</span><span class="delete option">s</span>';
		el.innerHTML = '<span class="txt">'+name+'</span>' + opc;
		//Saves the name in the dataset
		el.dataset.name = name;
		//Set this element dragable
		el.draggable = true;
		//Inserts the element before the newnote
		menulist.insertBefore(el, newnote);
		//Adds the DnD event handles to this item
		applyDragHandlers(el);
};

/**
 * Notifies to the user that the actual note has being saved.
 * The animation is via CSS3
 */
function notifySaved(){
	var status = document.getElementById('status');
	status.innerHTML = 'note saved!';
	status.className = 'show';
	setTimeout(function(){
		status.className = 'show hide';
	}, 200);
};


/**
 * Shows the App Shortcuts :D
 */
function showShortcuts(){
	var message = 
		"<div class='shortcuts'> "+
			"<h1>Notes Application' Shortcuts</h1>"+
			// "(Cmd in Mac, Ctrl in Windows/Linux)<br>"+
			"<span class='key'>Cmd</span> + <span class='key'>B</span> = Bold<br>"+
			"<span class='key'>Cmd</span> + <span class='key'>U</span> = Underline<br>"+
			"<span class='key'>Cmd</span> + <span class='key'>K</span> = Strike Through<br>"+
			"<span class='key'>Cmd</span> + <span class='key'>I</span> = Italic<br>"+
			"<span class='key'>Cmd</span> + <span class='key'>E</span> = Erase format<br>"+
			"<span class='key'>Cmd</span> + <span class='key'>L</span> = Unordered list<br>"+
			"<span class='key'>Cmd</span> + <span class='key'>Shift</span> + <span class='key'>l</span> = Ordered list<br>"+
			"<span class='key'>Cmd</span> + <span class='key'>}</span> = Indent<br>"+
			"<span class='key'>Cmd</span> + <span class='key'>{</span> = Outdent<br>"+
			"<br>"+
			"<span class='key'>Cmd</span> + <span class='key'>S</span> = Saves (again)<br>"+
			"<span class='key'>Alt</span> + <span class='key'>S</span> = Shortcuts info (this message)<br>"+
			"<span class='key'>Alt</span> + <span class='key'>I</span> = About the Notes App<br>"+
		"</div>";

	if(!navigator.userAgent.match(/mac os/gi)){
		message = message.replace(/Cmd/g,'Ctrl');
	}
	modal.alert(message, function(){
		textarea.contentDocument.body.focus();
	});
};

/**
 * Shows the About
 */
function showAbout(){
	var message = 
		"<div class='about'> \
			<h1>Hello!!</h1>\
			This application stores the data every time you type, which means, you dont need to press any button to save the info.<br><br>\
			Notes also lets you set styling on the notes via shortcuts like: Cmd+b, Cmd+i, etc. (For more information visit the shurcuts, or press Alt+s)!<br><br>\
			All your data is stored in the browser Local Storage, which means: your data won't ever be stored on the server, but in the browser, so... yes, you change from browser or open this in an incognito window and there won't be any of your notes.<br><br>\
			Is there a way to retrieve your notes and load them in other browser? yes! if you go to the menu options or press Alt+g, it will open a modal with the application data as text. And in the menu options or with Alt+l you can load (add/append) that data into the other Notes app.<br><br><br>\
			<h1>About me and Notes (v 0.2)</h1>\
			My name is David Avellaneda a.k.a. <a href='http://twitter.com/Davsket' target='_blank'>Davsket</a> and I built this app for my self and my friends.<br><br>\
			The source of this application can be found at <a href='http://github.com/davsket/notes' target='_blank'>Github</a>.<br><br>\
			Please enjoy it and any suggestion please let me know via <a href='http://twitter.com/intent/tweet?text=Hey @notes_app, I like your app but...' target='_blank'>Twitter: @notes_app</a>. <br><br><br>\
			<h1>Notes (v 0.2) change log</h1>\
			(27/may/2012) Adjustments for perfomance when storing pretty laaarge notes.<br><br>\
			(27/may/2012) The styles have being improved for offline editing. <br><br>\
			(27/may/2012) Now it doesn't matter if you have a large list of notes, you can scroll them. <br><br>\
			(27/may/2012) Improved modals :) no more awefull internal scrolls. <br><br>\
			(27/may/2012) Several minor fixes. <br><br>\
			(xx/mar/2012) Improved shortcuts and the first offline mode out.<br><br><br>\
		</div>";

	hideMenu();
	
	modal.alert(message, function(){
		textarea.contentDocument.body.focus();
	}, true);
};

/**
 * Shows the LocalStorage Data
 */
function showData(){
	var message;
	
	hideMenu();
	
	
	message = 
		"<div class='data-output'> "+
			"<h1>This is your data:</h1> Please copy this:<br><br> <textarea>"+ getJSONData() +
		"</textarea></div>";
	modal.alert(message, function(){
		textarea.contentDocument.body.focus();
	});

	$$('#modal textarea')[0].select();
};

/**
 * Gets all the data in a JSON String
 * @return JSON {String} 
 */
 function getJSONData(){
 	var  i, data = {}
		notes = localStorage.getItemJSON(listsPrefix);
 	for(i=0; i<notes.length; i++){
		data[notes[i]] = localStorage.getItemJSON(notesPrefix+notes[i]);
	}
	return JSON.stringify(data);
 }

/**
 * Shows the LocalStorage Data
 */
function importData(){
	var i, data = {},
		wrapper = document.createElement('div'),
		title = document.createElement('h1'),
		message = document.createElement('div'),
		textarea = document.createElement('textarea'),
		importB = document.createElement('button');

	wrapper.addClassName('alert about');
	title.innerHTML = 'Notes Importer';
	message.innerHTML = 'Please enter your data here:<br><br>';
	importB.innerHTML = 'import';

	importB.addEventListener('click', _importData.bind(textarea));
	importB.addEventListener('click', modal.hide.bind(modal));

	wrapper.appendChild(title);
	wrapper.appendChild(message);
	wrapper.appendChild(textarea);
	wrapper.appendChild(importB);

	// 	notes = localStorage.getItemJSON(listsPrefix);

	// for(i=0; i<notes.length; i++){
	// 	data[notes[i]] = localStorage.getItemJSON(notesPrefix+notes[i]);
	// }
	// message = 
	// 	"<div class='data-output'> "+
	// 		"<h1>This is your data:</h1> Please copy this:<br><br> <textarea>"+ JSON.stringify(data)+
	// 	"</textarea></div>";
	// modal.alert(message, function(){
	// 	textarea.contentDocument.body.focus();
	// });

	hideMenu();



	modal.setClosable(true);
	modal.setContent(wrapper);

	modal.show();

	textarea.focus();

	// modal.alert('This option will be available soon');
};

/**
 * Sends an email with the actual note
 */
function sendEmail(){
	modal.prompt('Please insert here your email:', function(res){
		if(res){
			var req = new XMLHttpRequest(),
				params = 'email=' + encodeURIComponent(res) + '&note=' + encodeURIComponent(localStorage.getItemJSON(notesPrefix+localStorage.getItemJSON(lastPrefix)));
			
			req.open('POST', '/send_to_email', true);
			req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			req.setRequestHeader("Content-length", params.length);
			req.setRequestHeader("Connection", "close");
			req.send(params);
			req.onload = function(e) {  
				if(req.status == 200){
					modal.alert('The note has being sent.');
				}else{
					modal.alert('Sorry, there was a problem with the server, please tray again later.');
				}
			}
		}
	});
}

/**
 * Listen the import click event and does the dirty job.
 * 
 * @param {Event} evt
 */
function _importData(evt){
	var value, note, list = localStorage.getItemJSON(listsPrefix),
		imported = [], index;

	function NonObject(message){
		this.name = 'NonObject';
		this.message = message;
	}

	try{
		value = JSON.parse(this.value);
		if(typeof value == 'object'){
			for(key in value){
				note = value[key];
				if(typeof key == 'string'){
					index = list.indexOf(key);
					if(index==-1){
						list.push(key);
						localStorage.setItem(listsPrefix, JSON.stringify(list));
					}
					localStorage.setItem(notesPrefix+key, note);
					createMenuItem(key);
					imported.push(key);
				}else{
					throw new NonObject("the format of the data is incorrect."+(imported.length?' Except for these notes, the other couldn\'t be imported: '+imported.join(', '):''));
				}
			}
			setTimeout((function(that){
				return function(){
					var message = 'These notes were imported successfully:<br><br> '+ imported.join('<br>');
					if(that.firstTime)
						message = 'Welcome back! Your notes: '+ imported.join(', ')+', were imported successfully. Please the next time enter to <bold><a href="http://notes.davsket.me">notes.davsket.me</a></bold> instead of the old <strike>davsket.me/notes</strike> version. <br><br> Thank you!'
					modal.alert(message);
				}
			})(this), 300);
		}else{
			throw new NonObject("the format of the data is incorrect.");
		}
	}catch(e){
		console.log(e);
		if(e instanceof NonObject){
			setTimeout(function(){
				modal.alert('Sorry, the data couldn\'t be imported, '+ e.message);
			}, 300);
		}
		else{
			setTimeout(function(){
				modal.alert('Sorry, the data couldn\'t be imported, the data is corrupt or null.');
			}, 300);
		}
	}
}

/**
 * Hides temproaly the menu
 */
function hideMenu(){
	menulist.style.display='none';
	menuExportData.parentElement.parentElement.style.display='none';
	setTimeout(function(){
		menulist.style.display=''; 
		menuExportData.parentElement.parentElement.style.display='';
	},300);	
}


/////////////////////////////////////////
//KEY EVENTS FUNCTIONS 
/////////////////////////////////////////

/**
 * Listen the keyup events from the title input
 * and asigns to the actual note it's new name
 * 
 * @param {Event} evt
 */
function titleKeyUpEvents(evt){
	var name = this.value,
		liNode,
		textNode;
	
	clearTimeout(timeOutKey);
	
	if(lastNoteName === name)
			return true;

	if(name === ""){
		this.value = lastNoteName;
		return true;
	}


	timeOutKey = setTimeout((function(name, lastNoteName){ 
		return function blind(){
			liNode = $$('[data-name="'+lastNoteName+'"]')[0];
			textNode = $$('[data-name="'+lastNoteName+'"] .txt')[0];

			//Reset the parent node data
			liNode.dataset.name = name;
			textNode.innerHTML = name;
			//Rename the local storage note name
			localStorage.setItem(notesPrefix+name, localStorage.getItem(notesPrefix+lastNoteName));
			//Update the notes list
			newlists = localStorage.getItemJSON(listsPrefix);
			newlists.splice(newlists.indexOf(lastNoteName), 1);
			newlists.push(name);

			localStorage.setItem(listsPrefix, JSON.stringify(newlists));
			localStorage.setItem(lastPrefix, name);
			
			//Load this note (sets this note as actual)
			lastNoteName = name;
			loadNote(name, true);
		}
	 })(name, lastNoteName), 300);
};

/**
 * Listen the keyup events and notifies 'saved'
 * if the key pressed was a regular symbol key
 *
 * @param {String} name
 */
function textareaKeyUpEvents(evt){
	var kc = evt.keyCode;
	if(
		kc == 8 || // Backspace
		kc == 9 || // Tab
		kc == 13 || // Enter
		kc == 45 || // Insert
		kc == 46 || // Delete
		kc >= 48 && kc <= 57 || // Numbers
		kc >= 65 && kc <= 90 || // Letters
		kc >= 96 && kc <= 111 || // Numberpad
		kc >= 186 && kc <= 192 || // Punctuation
		kc >= 219 && kc <= 222 // Symbols
	){
		clearTimeout(timeOut);
		setTimeout(notifySaved, 1000);
	}

	keyUpDownEvents.apply(this, arguments);
	
	return false;
};

/**
 * Listen the keydown events and executes
 * command actions
 *
 * @param {String} name
 */
function textareaKeyDownEvents(evt){
	var kc = evt.keyCode,
		//If ctrl for non mac or command for mac
		action = evt.ctrlKey || evt.metaKey;


	if(action){
		//Cmd+s, Save
		if(kc == 83){
			evt.preventDefault();
			notifySaved();
		}
		//Cmd+b, Bold
		else if(kc==66){
			evt.preventDefault();
			textarea.contentDocument.execCommand('bold', false);
		}
		//Cmd+u, Underline
		else if(kc==85){
			evt.preventDefault();
			textarea.contentDocument.execCommand('underline', false);
		}
		//Cmd+k, strikeThrough
		else if(kc==75){
			evt.preventDefault();
			textarea.contentDocument.execCommand('strikeThrough', false);
		}
		//Cmd+i, Italic
		else if(kc==73){
			evt.preventDefault();
			textarea.contentDocument.execCommand('italic', false);
		}
		//Cmd+e, Erase format
		else if(kc==69){
			evt.preventDefault();
			textarea.contentDocument.execCommand('removeFormat', false);
		}
		//Cmd+l, Unordered List
		else if(kc==76 && !evt.shiftKey){
			evt.preventDefault();
			textarea.contentDocument.execCommand('insertUnorderedList', false);
		}
		//Cmd+shift+l, Ordered List
		else if(kc==76 && evt.shiftKey){
			evt.preventDefault();
			textarea.contentDocument.execCommand('insertOrderedList', false);
		}
		//Cmd+}, Indent
		else if(kc==221){
			evt.preventDefault();
			textarea.contentDocument.execCommand('indent', false);
		}
		//Cmd+{, Outdent
		else if(kc==219){
			evt.preventDefault();
			textarea.contentDocument.execCommand('outdent', false);
		}
	}

	keyUpDownEvents.apply(this, arguments);
	
	return false;
};

/**
 * Listen the keydown events and executes
 * actions globally
 *
 * @param {String} name
 */
function keyUpDownEvents(evt){
	//If ctrl for non mac or command for mac
	var kc = evt.keyCode, 
		action = evt.ctrlKey || evt.metaKey;

	if(evt.altKey){
		if(evt.type != 'keyup'){
			if(kc == 83 || kc == 229 || kc == 73 || kc == 71 || kc == 76){
				evt.preventDefault();
			}
		}else{
			//Alt+s, Shortcuts
			if(kc == 83 && evt.type == 'keyup'){
				evt.preventDefault();
				showShortcuts();
			}
			//Alt+i, About 
			else if(kc == 73 && evt.type == 'keyup'){
				evt.preventDefault();
				showAbout();
			}
			//Alt+g, About 
			else if(kc == 71 && evt.type == 'keyup'){
				evt.preventDefault();
				showData();
			}
			//Alt+l, About 
			else if(kc == 76 && evt.type == 'keyup'){
				evt.preventDefault();
				importData();
			}
		}

	}

	else if(action){
		//Cmd+s, Save
		if(kc == 83){
			evt.preventDefault();
			notifySaved();
		}
	}

	saveContent();
};


/////////////////////////////////////////
//DRAG AND DROP FUNCTIONS FOR THE MENU
/////////////////////////////////////////

/**
 * Cancels the DnD event
 *
 * @param {Event} evt
 */
function cancelDnD(evt){
	evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
	return false;
};

/**
 * When the DnD event starts
 *
 * @param {Event} evt
 */
function handleDragStart(evt) {
	//Adds the draggin class to the elem
    this.addClassName('dragging');  // this / evt.target is the source node.
    dragSrcEl = this;
    //Allow to move
    evt.dataTransfer.effectAllowed = 'move';
    //FIXME? sets the data transfer to HTML (well... is an HTML element)
    evt.dataTransfer.setData('text/html', this.innerHTML);
}

/**
 * When the dragged element is over a dropable element
 *
 * @param {Event} evt
 */
function handleDragOver(evt) {
    if (evt.preventDefault) {
        //Necessary. Allows us to drop:
        evt.preventDefault(); 
    }
    //Allow to move
    evt.dataTransfer.dropEffect = 'move';  
    return false;
}

/**
 * When the draged element enters into a dropable element
 *
 * @param {Event} evt
 */
function handleDragEnter(evt) {
    //this / e.target is the current hover target.
    //If I'm not the dragged element, then add me
    //the over class
    if(!this.hasClassName('dragging')){
        this.addClassName('over');
    }
}

/**
 * When the dragged element leaves a droppable element
 *
 * @param {Event} evt
 */
function handleDragLeave(evt) {
    //this / e.target is previous target element.
    this.removeClassName('over');  
}

/**
 * When the dragged element is droped on a droppable one
 *
 * @param {Event} evt
 */
function handleDrop(evt) {
	var prev, prevTxt, thisTxt,
		lists  = localStorage.getItemJSON(listsPrefix);
	
	//Stops the browser from redirecting.
	evt.stopPropagation(); 

    //Don't do anything if dropping the same column we're dragging.
    if (dragSrcEl != this) {
    	//Removes the dragged element from the menu
        prev = menulist.removeChild(dragSrcEl);
        //Get the drag an drop elements names
        prevTxt = prev.dataset.name;
        thisTxt = this.dataset.name;
        //Insert the dragged element before the droppable
        menulist.insertBefore(prev, this);

        //Removes the note form its position
        for(var i=0; i<lists.length; i++){
            if(lists[i].replace(notesPrefix,'') === prevTxt){
                lists.splice(i, 1);
                break;
            }
        }
        //Insert it on the new position
        for(var i=0; i<lists.length; i++){
            if(lists[i].replace(notesPrefix,'') === thisTxt){
                lists.splice(i, 0, prevTxt);
                break;
            }
        }
        //Saves the changes
        localStorage.setItem(listsPrefix, JSON.stringify(lists));
    }

  return false;
}

/**
 * When the DnD even ends
 *
 * @param {Event} evt
 */
function handleDragEnd(e) {
	//Iterates over all the draggable elements and removes the classes
	$$('#menu li:not(#newnote)').forEach(function (elem) {
	    elem.removeClassName('over');
	    elem.removeClassName('dragging');
	});
}

/**
 * Apply the DnD events to the given element
 *
 * @param {Element} elem
 */
function applyDragHandlers(elem) {
    elem.addEventListener('dragstart', handleDragStart);
    elem.addEventListener('dragenter', handleDragEnter);
    elem.addEventListener('dragover', handleDragOver);
    elem.addEventListener('dragleave', handleDragLeave);
    elem.addEventListener('drop', handleDrop);
    elem.addEventListener('dragend', handleDragEnd);
}


////////////////////////////////////////////
//DRAG AND DROP FUNCTIONS FOR THE TEXTAREA
////////////////////////////////////////////

/**
 * Handles the Drop event on the textarea iframe
 *
 * @param {Event} evt
 */
function onDropEvent(evt){
	evt.preventDefault();
	//If the drop event has types the paste is different
	if (evt.dataTransfer.types){
		//I only get the first type, because usually there
		//are more than one, for example, HTML comes as 
		//HTML, and Text
		var type = evt.dataTransfer.types[0];
		//If the pase is file type...
		if(type == 'Files'){
    		var file = evt.dataTransfer.files[0],
				reader = new FileReader();
			// console.log(file.type);
			//And if has not type or is of text type..
			if(!file.type || file.type.match(/text/)){
				//I ask the user to insert it as a new note 
				//or use teh actual one
				modal.confirm('Do you want to load this file as a new note with name: '+file.name+'?', function(res){
					reader.onload = function (event) {
						var result = event.target.result;
						if(!file.type || !file.type.match(/html/)){
							//If the file is not as HTML (which means it can be HTML as code)
							//I do parse it to HTML notation :)
							result = result.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>').replace(/\s/g,'&nbsp;');
						}
						//If the user wants a new note...
						if(res){
							createNote(file.name);
							localStorage.setItem(notesPrefix+file.name,result);
							loadNote(file.name);
						}
						//else he wants to append it in the actual..
						else{
							textarea.document.execCommand('InsertHTML', false, result);
							saveContent();
						}
					};
					reader.readAsText(file);
				});
			}
			//Else if the file is an image...
			else if(file.type.match(/image/)){
				//I load the data as a DataURL
				reader.onload = function (event) {
						var result = event.target.result;
						//And generates the image tag with the DataURL
			    		textarea.document.execCommand('InsertHTML', false, '<img src="'+result+'"/>');
						saveContent();
					};
				reader.readAsDataURL(file);
			}
    	}
    	else{
    		//For default I insert the data as the first type
    		textarea.document.execCommand('InsertHTML', false, evt.dataTransfer.getData(type));
			saveContent();
    	}
	}
	else {
		//As before, insert the data as text
		textarea.document.execCommand('InsertHTML', false, evt.dataTransfer.getData(type));
		saveContent();
	}

	return false;
};



/************************************
 * APPLICATION INITIALIZATION
 ************************************/
initializeNotes();