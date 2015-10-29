var menubar = require('menubar')
var fs = require('fs')
var ipc = require('ipc')
var clipb = require('clipboard')

var mb = menubar({preloadWindow: true, dir: __dirname + '/app', width: 400})


mb.on('ready', function ready () {
  var window = mb.window;
  window.openDevTools();
  window.webContents.on('did-finish-load', function() {
    try {
     //test to see if settings exist
     var path = mb.app.getPath('userData') + '/library.gifwit'
     fs.openSync(path, 'r+'); //throws error if file doesn't exist
     var data=fs.readFileSync(path); //file exists, get the contents
     mb.gifwit = JSON.parse(data); //turn to js object
     window.webContents.send('data-added',mb.gifwit.images);
     } catch (err) {
       console.log(err)
       //if error, then there was no settings file (first run).
       console.log("Gifwit Library missing from "+mb.app.getPath('userData')+'/library.gifwit')
     }

  })

  ipc.on('url-to-clipboard',function(data,returnVal) {
    clipb.writeText(returnVal);
    mb.hideWindow();
  })

  mb.on('show', function () {
    window.webContents.send('show');
  });

});
