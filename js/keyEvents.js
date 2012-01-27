textarea.addEventListener('keydown', function(evt){
	if(evt.metaKey && evt.keyIdentifier== "U+0053"){
		evt.preventDefault();
		notifySaved();
	}
	saveContent();
	return false;
});
textarea.addEventListener('keyup', function(evt){
	var kc = evt.keyCode;
	if(
		kc!=16 && //shift
		kc!=17 && //ctrl
		kc!=18 && //alt
		kc!=20 && //mayus
		kc!=27 && //escape
		kc!=37 && //leftkey
		kc!=38 && //upkey
		kc!=39 && //rightkey
		kc!=40 && //downkey
		kc!=93 && //cmd
		kc!=112 && //f1
		kc!=113 && //f2
		kc!=114 && //f3
		kc!=115 && //f4
		kc!=116 && //f5
		kc!=117 && //f6
		kc!=118 && //f7
		kc!=119 && //f8
		kc!=120 && //f9
		kc!=121 && //f10
		kc!=122 && //f11
		kc!=123 //f12
		//kc!=13 && //enter
		//kc!=32 && //space
		//kc!=46 && //deleteb
		//kc!=8 && //deletef
	){
		clearTimeout(timeOut);
		setTimeout(notifySaved, 5000);
	}
	resizeIframe();
	return;
});

function resizeIframe(){
	document.getElementById('textarea').style.height = getStyle(textarea.document.body, 'height');
}