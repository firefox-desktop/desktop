var Drag = {
  MIN_DRAG: 10,
  BORDER_WIDTH: 3,
  click: { x: 0, y: 0, border: null },
  original: { left: 0, top: 0, width: 0, height: 0 },
  hover: null,
  object: null,
  inProgress: false,

  enable: function(element, options) {
    element.addEventListener("mousedown", Drag.onMouseDown, false);
    element.addEventListener("mouseover", Drag.onMouseOver, false);
    element.addEventListener("mouseout", Drag.onMouseOut, false);
    document.addEventListener("mouseup", Drag.onMouseUp, false);
    document.addEventListener("mousemove", Drag.onMouseMove, false);
  },

  disable: function(element) {
    element.removeEventListener("mousedown", Drag.onMouseDown, false);
    element.removeEventListener("mouseover", Drag.onMouseOver, false);
    element.removeEventListener("mouseout", Drag.onMouseOut, false);
  },

  onMouseOver: function(e) {
    Drag.hover = e.currentTarget;
  },

  onMouseOut: function(e) {
    Drag.hover = null;
  },

  onMouseDown: function(e) {
    if (e.target.nodeName == "INPUT") return;

    Drag.object = e.currentTarget;
    Drag.click.x = e.pageX;
    Drag.click.y = e.pageY;
    Drag.click.border = Drag.getBorder(Drag.object, e.pageX, e.pageY);
    Drag.original = {
      left:   Drag.object.offsetLeft,
      top:    Drag.object.offsetTop,
      width:  Drag.object.offsetWidth,
      height: Drag.object.offsetHeight
    }
    e.preventDefault();
  },

  onMouseUp: function(e) {
    if (Drag.inProgress) {
      Drag.removeGlass();
      Drag.inProgress = false;

      var event = document.createEvent("Event");
      event.initEvent("drop", false, false);
      Drag.object.dispatchEvent(event);
    }
    Drag.object = null;
  },

  // Glass prevents onclick event after drop occurs

  createGlass: function(element) {
    var glass = document.createElement("div");
    glass.id = "glass";
    glass.style.position = "fixed";
    glass.style.left = 0;
    glass.style.top = 0;
    glass.style.right = 0;
    glass.style.bottom = 0;
    glass.style.zIndex = 1000;
    document.body.appendChild(glass);
  },

  removeGlass: function() {
    var glass = document.getElementById("glass");
    glass.parentNode.removeChild(glass);
  },

  getBorder: function(element, x, y) {
    var border = "";
    var deltaLeft = x - element.offsetLeft,
        deltaTop = y - element.offsetTop,
        deltaRight = element.offsetWidth - deltaLeft,
        deltaBottom = element.offsetHeight - deltaTop;

    if (deltaTop > 0 && deltaTop < Drag.BORDER_WIDTH) border = "n";
    else if (deltaBottom > 0 && deltaBottom < Drag.BORDER_WIDTH) border = "s";
    if (deltaLeft > 0 && deltaLeft < Drag.BORDER_WIDTH) border += "w";
    else if (deltaRight > 0 && deltaRight < Drag.BORDER_WIDTH) border += "e";
    return border;
  },

  onMouseMove: function(e) {
    if (!Drag.inProgress && Drag.object &&
        Math.abs(Drag.click.x - e.pageX) +
        Math.abs(Drag.click.y - e.pageY) > Drag.MIN_DRAG)
    {
      Drag.inProgress = true;
      Drag.createGlass();
    }
    if (Drag.inProgress) {
      var deltaX = e.pageX - Drag.click.x;
      var deltaY = e.pageY - Drag.click.y;
    
      if (Drag.click.border.match(/e/)) {
        var newWidth = Drag.original.width + deltaX;
        Drag.object.style.width = Math.max(newWidth, 0);
      }
      if (Drag.click.border.match(/s/)) {
        var newHeight = Drag.original.height + deltaY;
        Drag.object.style.height = Math.max(newHeight, 0);
      }
      if (Drag.click.border.match(/w/)) {
        var right = Drag.original.left + Drag.original.width;
        Drag.object.style.left = Math.min(Drag.original.left + deltaX, right);
        Drag.object.style.width = right - Drag.object.offsetLeft;
      }
      if (Drag.click.border.match(/n/)) {
        var bottom = Drag.original.top + Drag.original.height;
        Drag.object.style.top = Math.min(Drag.original.top + deltaY, bottom);
        Drag.object.style.height = bottom - Drag.object.offsetTop;
      }
      if (!Drag.click.border) {
        Drag.object.style.left = Drag.original.left + deltaX;
        Drag.object.style.top = Drag.original.top + deltaY;
      }
      var event = document.createEvent("Event");
      event.initEvent(Drag.click.border ? "resize" : "drag", false, false);
      Drag.object.dispatchEvent(event);
    }
    if (Drag.hover) {
      var border = Drag.getBorder(Drag.hover, e.pageX, e.pageY);
      var cursor = border ? border + "-resize" : "";
      Drag.hover.style.cursor = e.target.style.cursor = cursor;
    }
  }
}