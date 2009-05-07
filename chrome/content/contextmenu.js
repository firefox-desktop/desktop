var ContextMenu = {
  click: { x: 0, y: 0 },
  current: null,

  enable: function(element, menu) {
    var handler = function(e) {
      if (e.button != 2) return;
      e.preventDefault();
      ContextMenu.click.x = e.pageX;
      ContextMenu.click.y = e.pageY;
      ContextMenu.open(menu, e.pageX, e.pageY);
    };
    element.addEventListener("contextmenu", handler, false);
    element.addEventListener("dblclick", handler, false);
  },

  open: function(menu, x, y) {
    ContextMenu.close();
                                 
    ContextMenu.current = menu;
    document.body.appendChild(ContextMenu.current);
    ContextMenu.showSubmenu(ContextMenu.current, x, y);

    document.addEventListener("click", ContextMenu.close, false);
    document.addEventListener("blur", ContextMenu.close, false);
  },

  close: function() {
    if (ContextMenu.current) {
      document.addEventListener("click", ContextMenu.close, false);
      document.addEventListener("blur", ContextMenu.close, false);
      Dom.remove(ContextMenu.current);
      ContextMenu.current = null;
    }
  },

  showSubmenu: function(menu, x, y) {
    for(var i = 0; i < menu.childNodes.length; i++) {
      var child = menu.childNodes[i];
      if (child.nodeName != "LI") continue;

      child.addEventListener("mouseover", ContextMenu.onItemOver, false);
      var submenu = ContextMenu.getSubmenu(child);
      if (submenu) {
        ContextMenu.hideSubmenu(submenu);
        Dom.addClass(child, "container");
        child.addEventListener("click", ContextMenu.onContainerClick, false);
      }
    }
    Dom.addClass(menu, "contextmenu");
    menu.style.left = x;
    menu.style.top = y;
    menu.style.display = "block";
  },

  hideSubmenu: function(menu) {
    menu.style.display = "none";
  },

  getSubmenu: function(item) {
    return Dom.child(item, "ul");
  },

  onItemOver: function(e) {
    if (e.target != e.currentTarget) return;

    var menu = e.target.parentNode;
    for(var i = 0; i < menu.childNodes.length; i++) {
      var item = menu.childNodes[i];
      var submenu = ContextMenu.getSubmenu(item);
      if (submenu) {
        var x = menu.offsetWidth - 2;
        var y = item.offsetLeft - 1;
        item == e.target ? ContextMenu.showSubmenu(submenu, x, y)
                         : ContextMenu.hideSubmenu(submenu);
      }
    }
  },

  onContainerClick: function(e) {
    if (e.target == e.currentTarget) e.stopPropagation();
  }
}