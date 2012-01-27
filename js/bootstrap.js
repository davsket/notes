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
	
style.setAttribute('href', 'css/iframe_doc.css?a='+(new Date().getTime()));
style.setAttribute('rel', 'stylesheet');
style.setAttribute('type', 'text/css');

textarea.document.head.appendChild(fonts);
textarea.document.head.appendChild(style);

Storage.prototype.getItemJSON = function(item){
	var val = this.getItem(item)||'null';
	try{
		return JSON.parse(val);
	}catch(e){
		return val;
	}
}
