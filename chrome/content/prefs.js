var Prefs = {
  prefs: Components.classes["@mozilla.org/preferences-service;1"]
         .getService(Components.interfaces.nsIPrefService)
         .getBranch("extensions.desktop."),

  getInt: function(name) {
    try {
      return this.prefs.getIntPref(name);
    } catch(e) {
      return 0;
    }
  },

  setInt: function(name, value) {
    this.prefs.setIntPref(name, value);
  },

  getString: function(name) {
    try {
      return this.prefs.getComplexValue(name,
        Components.interfaces.nsISupportsString).data;
    } catch(e) {
      return null;
    }
  },

  setString: function(name, value) {
    var str = Components.classes["@mozilla.org/supports-string;1"]
              .createInstance(Components.interfaces.nsISupportsString);
    str.data = value;
    this.prefs.setComplexValue(name,
      Components.interfaces.nsISupportsString, str);
  },

  getBool: function(name) {
    try {
      return this.prefs.getBoolPref(name);
    } catch(e) {
      return false;
    }
  },

  setBool: function(name, value) {
    this.prefs.setBoolPref(name, value);
  },

  getObject: function(name) {
    return Utils.fromJSON(this.getCharPref(name));
  },

  setObject: function(name, value) {
    this.setCharPref(name, Utils.toJSON(value));
  },

  delete: function(name) {
    try {
      if (name) this.prefs.deleteBranch(name);
    } catch(e) {}
  },

  clear: function(name) {
    try {
      if (name) this.prefs.clearUserPref(name);
    } catch(e) {}
  }
}
