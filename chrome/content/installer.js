rtimushev.ffdesktop.Installer = new function () {

    var Desktop = rtimushev.ffdesktop.Desktop
    var Installer = this

    this.newTabURI = "chrome://desktop/content/desktop.html"

    this.installed = false
    this.oldURLBarSetURI
    this.oldGBrowserAddTab

    function installNormal() {
        if (Installer.installed) return;
        Installer.installed = true;
        Installer.oldURLBarSetURI = window.URLBarSetURI;
        window.URLBarSetURI = function () {
            var result = rtimushev.ffdesktop.Installer.oldURLBarSetURI.apply(this, arguments);
            if (gURLBar.value.substr(0, rtimushev.ffdesktop.Installer.newTabURI.length) === rtimushev.ffdesktop.Installer.newTabURI) gURLBar.value = "";
            return result;
        }
        Installer.oldGBrowserAddTab = gBrowser.addTab;
        gBrowser.addTab = function () {
            if (arguments.length > 0 && arguments[0] == 'about:blank')
                arguments[0] = rtimushev.ffdesktop.Installer.newTabURI;
            return rtimushev.ffdesktop.Installer.oldGBrowserAddTab.apply(this, arguments);
        }
    }

    var Watcher = new function () {
        this.observe = function (subject, topic, data) {
            if (topic != "nsPref:changed") return;
            switch (data) {
                case "backgroundStyle":
                    Desktop.forEachDesktopBrowser(Desktop.reloadPage);
                    break;
            }
        }
    }

    function install() {
        setTimeout(installNormal, 0);
        this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
            .getService(Components.interfaces.nsIPrefService)
            .getBranch("extensions.desktop.");
        this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
        this.prefs.addObserver("", Watcher, false);
    }

    this.load = function () {
        addEventListener("load", install, true);
    }

}
