rtimushev.ffdesktop.Installer = new function() {

    var Desktop = rtimushev.ffdesktop.Desktop

    var newTabURI = "chrome://desktop/content/desktop.html"

    function installNormal() {
        var old1 = window.URLBarSetURI;
        window.URLBarSetURI = function() {
            var result = old1.apply(this, arguments);
            if (gURLBar.value == newTabURI) gURLBar.value = "";
            return result;
        }
        var old2 = gBrowser.addTab;
        gBrowser.addTab = function() {
            if (arguments.length > 0 && arguments[0] == 'about:blank')
            arguments[0] = newTabURI;
            return old2.apply(this, arguments);
        }
    }

    var Watcher = new function() {
        this.observe = function(subject, topic, data) {
           if (topic != "nsPref:changed") return;
            switch(data) {
                case "backgroundStyle":
                Desktop.forEachDesktopBrowser(Desktop.reloadPage);
                break;
            }
        }
    }

    function install() {
        installNormal();
        this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
            .getService(Components.interfaces.nsIPrefService)
            .getBranch("extensions.desktop.");
        this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
        this.prefs.addObserver("", Watcher, false);
    }

    this.load = function() {
        addEventListener("load", install, true);
    }

}
