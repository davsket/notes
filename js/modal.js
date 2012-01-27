//Modal
function Modal(content, closable){
	var modal = document.getElementById('modal'),
		closeB = modal.getElementsByClassName('close')[0],
		contentW = modal.getElementsByClassName('content')[0],
		back = modal.getElementsByClassName('back')[0];
	this.show = function(){
		modal.className = 'show';
	}
	this.hide = function(){
		modal.className = '';
	}
	this.setContent = function(content){
		contentW.innerHTML = '';
		if(typeof content == 'object'){
			contentW.appendChild(content);
		}else if(typeof content == 'string'){
			contentW.innerHTML = content;
		}
	}
	this.setClosable = function(closable){
		closeB.style.display = closable ? 'block' : 'none';
	}

	//setup
	this.setContent(content);
	this.setClosable(closable);
	closeB.onclick = (function(modal){
		return function(){modal.hide();};
		})(this);
	

	this.confirm = function(question, callback){
		var wrapper = document.createElement('div'),
			message = document.createElement('div'),
			ok = document.createElement('button'),
			cancel = document.createElement('button');
		wrapper.className = 'prompt';
		message.className = 'message';
		ok.className = 'ok';
		cancel.className = 'cancel';
		
		message.innerHTML = question;
		ok.innerHTML = 'ok';
		cancel.innerHTML = 'cancel';

		ok.onclick = (function(modal, callback){
			return function(){
				modal.hide();
				textarea.document.body.focus();
				callback(true);
			}
		})(this, callback);

		cancel.onclick = (function(modal, callback){
			return function(){
				modal.hide();
				textarea.document.body.focus();
				callback(false);
			}
		})(this, callback);

		this.setClosable(false);

		contentW.innerHTML = '';
		wrapper.appendChild(message);
		wrapper.appendChild(ok);
		wrapper.appendChild(cancel);
		contentW.appendChild(wrapper);

		this.show();

		ok.focus();
	}


	this.prompt = function(question, callback){
		var wrapper = document.createElement('div'),
			message = document.createElement('div'),
			ok = document.createElement('button'),
			input = document.createElement('input'),
			cancel = document.createElement('button');
		wrapper.className = 'prompt';
		message.className = 'message';
		ok.className = 'ok';
		cancel.className = 'cancel';
		input.className = 'text';
		
		message.innerHTML = question;
		ok.innerHTML = 'ok';
		cancel.innerHTML = 'cancel';

		ok.onclick = (function(modal, callback, input){
			return function(){
				modal.hide();
				textarea.document.body.focus();
				callback(input.value);
			}
		})(this, callback, input);

		cancel.onclick = (function(modal, callback){
			return function(){
				modal.hide();
				textarea.document.body.focus();
				callback(null);
			}
		})(this, callback);

		input.addEventListener('keyup', (function(modal, callback){
			return function(evt){
				if(evt.keyCode == 13){
					modal.hide();
					textarea.document.body.focus();
					callback(this.value);
				}
			}
		})(this, callback));

		this.setClosable(false);

		contentW.innerHTML = '';
		wrapper.appendChild(message);
		wrapper.appendChild(input);
		wrapper.appendChild(document.createElement('br'));
		wrapper.appendChild(ok);
		wrapper.appendChild(cancel);
		contentW.appendChild(wrapper);

		this.show();

		input.focus();
	}
}