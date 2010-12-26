Desktop = {

    isDesktop : function(doc) {
        return doc && doc.location
                && /chrome:\/\/desktop\/content\/desktop.html(\?.*)?/.test(doc.location.href);
    },

    reloadPage : function(doc) {
        doc.reload(false);
    },

    forEachDesktopBrowser : function(onPage) {
        var gBrowser = Utils.getBrowser();
        for (var i = 0; i < gBrowser.browsers.length; i++) {
            var br = gBrowser.browsers[i];
            if (Desktop.isDesktop(br.contentDocument))
                onPage(br);
        }
    },

    openPreferences : function() {
        if (!Desktop.prefsWindow || Desktop.prefsWindow.closed) {
            Desktop.prefsWindow = window.openDialog(
                    "chrome://desktop/content/preferences.xul",
                    "desktop-preferences-window",
                    "chrome,toolbar,centerscreen,resizable=yes");
        } else
            Desktop.prefsWindow.focus();
    },

    isBackgroundImageSpecified : function() {
        var bg = File.getDataDirectory();
        bg.append("background");
        return bg.exists();
    },
    
    translate : function(key) {
        if (!Desktop.bundle) {
            Desktop.bundle = Components.classes["@mozilla.org/intl/stringbundle;1"]  
                .getService(Components.interfaces.nsIStringBundleService)  
                .createBundle("chrome://desktop/locale/desktop.properties");
        }
        return Desktop.bundle.GetStringFromName(key);
    }

}
