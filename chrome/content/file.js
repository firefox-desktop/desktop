var File = {
  getDataDirectory: function() {
    var dir = Components.classes["@mozilla.org/file/directory_service;1"]
               .getService(Components.interfaces.nsIProperties)
               .get("ProfD", Components.interfaces.nsIFile);
    dir.append("desktop");
    if (!dir.exists()) {
      dir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
    }
    return dir;
  },

  writeFile: function(file, data) {
    var out = Components.classes["@mozilla.org/network/file-output-stream;1"]
              .createInstance(Components.interfaces.nsIFileOutputStream);
    out.init(file, 0x04 | 0x08 | 0x20, 0666, 0); // read & write, create, truncate
    out.write(data, data.length);
    out.close();
  },

  chooseFile: function(mode, filters, name) {
    var fp = Components.classes["@mozilla.org/filepicker;1"]
             .createInstance(Components.interfaces.nsIFilePicker);
    fp.init(window, null, mode == "save" ? fp.modeSave :
                          mode == "folder" ? fp.modeGetFolder : fp.modeOpen);
    for(var i in filters) {
      switch(filters[i]) {
        case "images": fp.appendFilters(fp.filterImages); break;
        case "html":   fp.appendFilters(fp.filterHTML); break;
        default:       fp.appendFilter(filter, filter); break;
      }
    }
    fp.appendFilters(fp.filterAll);
    fp.defaultString = name;

    var result = fp.show();
    if (result == fp.returnOK ||
        result == fp.returnReplace) return fp.file;
  },

  getNsiFile: function(file) {
    if (file instanceof Components.interfaces.nsIFile) return file;
    else {
      var nsiFile = Components.classes["@mozilla.org/file/local;1"]
                .createInstance(Components.interfaces.nsILocalFile);
      nsiFile.initWithPath(file);
      return nsiFile;
    }
  },

  getFileURL: function(file) {
    var nsiFile = File.getNsiFile(file);
    var ios = Components.classes["@mozilla.org/network/io-service;1"]
              .getService(Components.interfaces.nsIIOService);
    var fileHandler = ios.getProtocolHandler("file")
                     .QueryInterface(Components.interfaces.nsIFileProtocolHandler);
    return fileHandler.getURLSpecFromFile(nsiFile);
  }
}

var URL = {
  getNsiURL: function(url) {
    var nsiUrl = Components.classes["@mozilla.org/network/standard-url;1"]
               .createInstance(Components.interfaces.nsIURL);
    nsiUrl.spec = url;
    return nsiUrl;
  },

  getScheme: function(url) {
    if (url) {
      return URL.getNsiURL(url).scheme;
    }
  },

  readURL: function(url) {
    var ioService = Components.classes["@mozilla.org/network/io-service;1"]
                    .getService(Components.interfaces.nsIIOService);
    var channel = ioService.newChannel(url, null, null);
    var stream = channel.open();

    var binary = Components.classes["@mozilla.org/binaryinputstream;1"]
                 .createInstance(Components.interfaces.nsIBinaryInputStream);
    binary.setInputStream(stream);
    var data = binary.readBytes(binary.available());
    binary.close();
    stream.close();

    return data;
  },

  removeFromCache: function(url) {
    if (!url) return;

    var clientId = url.match(/^chrome:/) ? "image-chrome" : "image";
    var cacheSession = Components.classes["@mozilla.org/network/cache-service;1"]
                       .getService(Components.interfaces.nsICacheService)
                       .createSession(clientId, 0, false);
    try {
      var entry = cacheSession.openCacheEntry(url,
                    Components.interfaces.nsICache.ACCESS_READ, false);
      entry.doom();
    }
    catch(e) {}
  }
}
