var actualnote = '',
	listsPrefix = 'notes/lists',
	notesPrefix = 'notes/lists/',
	lastPrefix = 'notes/lastlist',
	clearTextarea = false,
	modal = new Modal(),
	timeOut;

//Iframe setup
textarea.document.designMode="on";
textarea.document.body.focus();
var fonts = textarea.document.createElement('link'),
	style = textarea.document.createElement('link');
	
fonts.setAttribute('href', 'http://fonts.googleapis.com/css?family=Droid+Sans');
fonts.setAttribute('rel', 'stylesheet');
fonts.setAttribute('type', 'text/css');
	
style.setAttribute('href', 'css/iframe_doc.css');
style.setAttribute('rel', 'stylesheet');
style.setAttribute('type', 'text/css');

textarea.document.head.appendChild(fonts);
textarea.document.head.appendChild(style);

document.getElementById('textarea').style.display = 'block';
