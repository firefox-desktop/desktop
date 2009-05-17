var Utils = {
  getQueryParams: function(url) {
    var params = new Array();
    var regexp = /[?&](\w+)=(\w+)/g;
    var match;
    while(match = regexp.exec(url)) {
      params[match[1]] = match[2];
    }
    return params;
  },

  lastUniqueId: 0,

  getUniqueId: function() {
    var id = Math.max(Utils.lastUniqueId + 1, new Date().getTime());
    return Utils.lastUniqueId = id;
  },

  clone: function(object) {
    return Utils.merge({}, object);
  },

  merge: function(target) {
    if (!target) target = new Object();

    for(var j = 1; j < arguments.length; j++) {
      var source = arguments[j];

      for(var i in source) {
        if (source[i] == null) continue;
        switch(typeof source[i]) {
          case "string":
          case "number":
          case "boolean":
          case "function":
              target[i] = source[i];
              break;
          default:
              target[i] = Utils.merge(target[i], source[i]);
              break;
        }
      }
    }
    return target;
  },

  toJSON: function(object, level) {
    var json = "";

    for(var i in object) {
      var value = object[i];
      if (value == null || typeof value == "function") continue;

      json += (json ? "," : "") + i + ":";
      switch(typeof value) {
        case "number":
        case "boolean":
            json += value;
            break;
        case "string":
            json += "'" + value.replace(/([\\\'\n])/g, "\\$1") + "'"; /* This comment was added to fix Midnight commander colorizing bug " */
            break;
        default:
            json += Utils.toJSON(value, level + 1);
            break;
      }
    }
    json = "{" + json + "}";
    return level ? json : "(" + json + ")";
  },

  confirm: function(message) {
    var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                  .getService(Components.interfaces.nsIPromptService);
    return prompts.confirm(window, Desktop.translate("Desktop"), message);
  },

  getBrowserWindow: function() {
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
             .getService(Components.interfaces.nsIWindowMediator);
    return wm.getMostRecentWindow("navigator:browser");
  },
  
  getBrowser: function() {
    return Utils.getBrowserWindow().getBrowser();
  },
  
  trim: function(str) {
    return str.replace(/^[\s]*(.*[\S])[\s]*$/, '$1');
  },
  
  getDocumentTab: function(doc) {
    var tabs = gBrowser.tabContainer.childNodes;
    for(var i = 0; i < tabs.length; i++) {
      if (tabs[i].linkedBrowser.contentDocument == doc) {
        return tabs[i];
      }
    }
  }
 
}
