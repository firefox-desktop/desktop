var TabLoader = {
  TIMEOUT: 100,
  url: null,
  isNewTab: false,

  load: function(url) {
    TabLoader.url = url;

    addEventListener("load", function() {
      TabLoader.loadInExistingTabs();

      gBrowser.addEventListener("load", BtTabLoader.onPageLoad, true);
      gBrowser.addEventListener("NewTab", BtTabLoader.onNewTab, false);

      var tabMenu = document.getAnonymousElementByAttribute(gBrowser, "anonid", "tabContextMenu");
      var newTabContextItem = tabMenu.firstChild;
      newTabContextItem.addEventListener("command", BtTabLoader.onNewTab, false);

      var newTabCommand = $("cmd_newNavigatorTab");
      newTabCommand.addEventListener("command", BtTabLoader.onNewTab, false);
    }, false);
  },

  isBlank: function(doc) {
    return doc && doc.location == "about:blank";
  },

  loadIn: function(doc) {
    doc.location = TabLoader.url;
    setTimeout(TabLoader.selectUrlBar, TabLoader.TIMEOUT);
  },

  loadInExistingTabs: function() {
    var tabs = gBrowser.tabContainer.childNodes;
    for(var i = 0; i < tabs.length; i++) {
      var tab = tabs[i];
      if (!tab.hasAttribute("busy")) {
        var doc = tab.linkedBrowser.contentDocument;
        if (TabLoader.isBlank(doc)) TabLoader.loadIn(doc);
      }
    }
  },

  onNewTab: function(e) {
    TabLoader.isNewTab = true;
  },

  onPageLoad: function(event) {
    var doc = event.originalTarget;
    if (doc.location == TabLoader.url) {
      TabLoader.addToHistory(doc.location, doc.title);
    }
    var singleTab = gBrowser.tabContainer.childNodes.length == 1;
    if ((TabLoader.isNewTab || singleTab) && TabLoader.isBlank(doc)) {
      TabLoader.isNewTab = false;
      TabLoader.loadIn(doc);
    }
  },

  addToHistory: function(url, title) {
    var entry = Components.classes["@mozilla.org/browser/session-history-entry;1"]
                .createInstance(Components.interfaces.nsISHEntry);
    entry.setURI(URL.getNsiURL(url));
    entry.setTitle(title);

    var sessionHistory = gBrowser.sessionHistory;
    sessionHistory.QueryInterface(Components.interfaces.nsISHistoryInternal);
    if (!sessionHistory.count) {
      sessionHistory.addEntry(entry, true);
    }
  },

  selectUrlBar: function() {
    $("urlbar").select();
  }
}
