rtimushev.ffdesktop.Thumbnail = function () {

    var Thumbnail = rtimushev.ffdesktop.Thumbnail
    var Utils = rtimushev.ffdesktop.Utils
    var Prefs = rtimushev.ffdesktop.Prefs
    var File = rtimushev.ffdesktop.File
    var Dom = rtimushev.ffdesktop.Dom
    var Widget = rtimushev.ffdesktop.Widget
    var URL = rtimushev.ffdesktop.URL

    const TIMEOUT_LOAD = 60 * 1000;
    const TIMEOUT_RENDER = 0.5 * 1000;
    var loading;

    this.setProperties = function (properties) {
        Thumbnail.prototype.setProperties.call(this, properties);

        if (!this.properties.width) {
            this.properties.width = Prefs.getInt("thumbnail.width");
            this.properties.height = Prefs.getInt("thumbnail.height");
        }
        if (this.properties.isFolder) {
            this.properties.url = "chrome://desktop/content/desktop.html?folder=" +
                this.properties.id;
        }
    }

    getImageFile = function () {
        return File.getDataFile(this.properties.id);
    }

    getImageURL = function () {
        if (this.properties.customImage)
            return this.properties.customImage
        else
            return File.getFileURL(getImageFile.call(this));
    }

    this.getIconURL = function () {
        return this.properties.isFolder ? "chrome://desktop/skin/folder.png"
            : Thumbnail.prototype.getIconURL.call(this);
    }

    this.createView = function () {
        return Dom.get("thumbnail").cloneNode(true);
    }

    this.updateView = function () {
        Thumbnail.prototype.updateView.call(this);

        var anchor = Dom.child(this.view, "a");
        this.properties.url ? anchor.href = this.properties.url

            : anchor.removeAttribute("href");

        var img = Dom.child(this.view, "img");
        img.src = getImageURL.call(this);
        img.style.display = loading ? "none" : "block";

        var throbber = Dom.child(this.view, "throbber");
        throbber.style.display = loading ? "block" : "none";
    }

    this.renderView = function () {
        Thumbnail.prototype.renderView.call(this);

        this.view.style.width = this.properties.width;
        this.view.style.height = this.properties.height;

        if (this.properties.url == undefined) {
            this.openProperties();
        }

        if (!this.properties.customImage && !getImageFile.call(this).exists()) this.refresh();
        else this.updateView();

        var self = this;

        this.view.addEventListener("drop", function () {
            Prefs.setInt("thumbnail.width", self.properties.width);
            Prefs.setInt("thumbnail.height", self.properties.height);
        }, false);

        // This code disables Tab Mix Plus "Force new tab" option. Magic.
        var anchor = Dom.child(this.view, "a");
        anchor.addEventListener("click", function (e) {
            if (e.button == 0 && !e.ctrlKey && !e.metaKey) {
                e.stopPropagation();
                return false;
            }
        }, false);

        return this.view;
    }

    this.remove = function () {
        if (Thumbnail.prototype.remove.call(this)) {
            try {
                getImageFile.call(this).remove(false);
            }
            catch (e) {
            }
        }
    }

    this.refresh = function () {
        if (this.properties.customImage) {
            this.updateView();
            return;
        }
        loading = true;
        this.updateView();
        refreshImage.call(this);
    }

    this.openProperties = function () {
        var param = { properties:Utils.clone(this.properties) };
        var xul = 'widgets/thumbnail/' +
            (this.properties.isFolder ? 'folder' : 'properties') + '.xul';

        openDialog(xul, "properties",
            "chrome,centerscreen,modal,resizable", param);
        if (param.properties) {
            var refreshNeeded = param.properties.url != this.properties.url ||
                param.properties.customImage != this.properties.customImage;
            this.properties = param.properties;
            this.save();

            refreshNeeded ? this.refresh() : this.updateView();
        }
    }

    function refreshImage() {
        var self = this;
        loadURI(this.properties.url || "about:blank", this.properties.width, this.properties.height - Widget.HEADER_HEIGHT, function (iframe) {
            if (!self.properties.title) {
                var doc = iframe.contentDocument;
                self.properties.title = doc.title;
                self.save.call(self);
            }
            if (self.properties.customImage) {
                Dom.remove(iframe);
                refreshCustomImage.call(self);
            }
            else saveImage.call(self, iframe);
        });
    }

    function saveImage(iframe) {
        var self = this;
        setTimeout(function () {
                var image = createImage(iframe, self.properties.width, self.properties.height - Widget.HEADER_HEIGHT);
                File.writeFile(getImageFile.call(self), image);
                Dom.remove(iframe);

                loading = false;

                URL.removeFromCache(getImageURL.call(self));
                self.updateView.call(self);
            },
            TIMEOUT_RENDER);
    }

    function createFrame(aspect) {
        var browserWindow = Utils.getBrowserWindow();
        var doc = browserWindow.document;

        var iframe = doc.createElement("browser");
        iframe.width = 1024;
        iframe.height = iframe.width * aspect;
        iframe.setAttribute("type", "content-targetable");
        iframe.style.overflow = "hidden";
        doc.getElementById("hidden-box").appendChild(iframe);
        return iframe;
    }

    function loadURI(url, width, height, onReady) {
        function onFrameLoad() {
            iframe.removeEventListener("load", onFrameLoad, true);
            clearTimeout(loadTimeout);
            onReady(iframe);
        }

        var iframe = createFrame(height / width);
        iframe.addEventListener("load", function (event) {
            if (event.originalTarget instanceof HTMLDocument) {
                var win = event.originalTarget.defaultView;
                if (win.frameElement) return;
            }
            onFrameLoad(event);
        }, true);
        var loadTimeout = setTimeout(onFrameLoad, TIMEOUT_LOAD);
        iframe.setAttribute("src", url);
    }

    function createImage(iframe, imageWidth, imageHeight) {
        var canvas = document.createElement("canvas");
        canvas.width = imageWidth;
        canvas.height = imageHeight;

        var context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);

        var width = iframe.width;
        var height = iframe.height;
        context.scale(canvas.width / width, canvas.height / height);
        context.drawWindow(iframe.contentWindow, 0, 0, width, height, "white");

        var dataURL = canvas.toDataURL("image/png");
        return atob(dataURL.replace(/^data:image\/png;base64,/, ""));
    }
}

rtimushev.ffdesktop.Thumbnail.prototype = new rtimushev.ffdesktop.Widget();
