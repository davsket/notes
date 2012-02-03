//MENU Drag N Drop
var elem, menuItems = document.querySelectorAll('#menulist li:not(#newnote)');

function handleDragStart(e) {
    this.addClassName('dragging');  // this / e.target is the source node.

    dragSrcEl = this;

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows us to drop.
    }

    e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.

    return false;
}

function handleDragEnter(e) {
    // this / e.target is the current hover target.
    if(!this.hasClassName('dragging'))
        this.addClassName('over');
}

function handleDragLeave(e) {
    this.removeClassName('over');  // this / e.target is previous target element.
}

function handleDrop(e) {
    // this / e.target is current target element.

    if (e.stopPropagation) {
        e.stopPropagation(); // stops the browser from redirecting.
    }

    // Don't do anything if dropping the same column we're dragging.
    if (dragSrcEl != this) {
        // Set the source column's HTML to the HTML of the columnwe dropped on.
        //dragSrcEl.innerHTML = this.innerHTML;
        //this.innerHTML = e.dataTransfer.getData('text/html');
        var prev = menulist.removeChild(dragSrcEl),
            prevTxt = prev.dataset.name,
            thisTxt = this.dataset.name;
        menulist.insertBefore(prev, this);
        var lists  = localStorage.getItemJSON(listsPrefix);
        for(var i=0; i<lists.length; i++){
            if(lists[i].replace(notesPrefix,'') === prevTxt){
                lists.splice(i, 1);
                break;
            }
        }
        for(var i=0; i<lists.length; i++){
            if(lists[i].replace(notesPrefix,'') === thisTxt){
                lists.splice(i, 0, prevTxt);
                break;
            }
        }
        localStorage.setItem(listsPrefix, JSON.stringify(lists));
    }


  // See the section on the DataTransfer object.

  return false;
}

function handleDragEnd(e) {
  // this/e.target is the source node.

    [].forEach.call(document.querySelectorAll('#menu li:not(#newnote)'), function (col) {
        col.removeClassName('over');
        col.removeClassName('dragging');
    });
}

function applyDragHandlers(col) {
    col.addEventListener('dragstart', handleDragStart, false);
    col.addEventListener('dragenter', handleDragEnter, false);
    col.addEventListener('dragover', handleDragOver, false);
    col.addEventListener('dragleave', handleDragLeave, false);
    col.addEventListener('drop', handleDrop, false);
    col.addEventListener('dragend', handleDragEnd, false);
}

[].forEach.call(menuItems, applyDragHandlers);