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

function getStyle(elem, styleProp)
{
	return elem.currentStyle ? elem.currentStyle[styleProp] : window.getComputedStyle(elem,null).getPropertyValue(styleProp);
};