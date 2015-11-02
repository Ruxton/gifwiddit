
var fs = require('fs')
var path = require('path')
var shell = require('shell')
var ipc = require('ipc')
var clipb = require('clipboard')
var menubar = require('menubar')
var globalShortcut = require('global-shortcut')

var mb = menubar({preloadWindow: true, dir: __dirname + '/app', width: 400})
var Menu = require('menu')

var menuTemplate = [
  {
    label: 'Gifwiddit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'Command+Z',
        selector: 'undo:'
      },
      {
        label: 'Redo',
        accelerator: 'Shift+Command+Z',
        selector: 'redo:'
      },
      {
        label: 'Cut',
        accelerator: 'Command+X',
        selector: 'cut:'
      },
      {
        label: 'Copy',
        accelerator: 'Command+C',
        selector: 'copy:'
      },
      {
        label: 'Paste',
        accelerator: 'Command+V',
        selector: 'paste:'
      },
      {
        label: 'Select All',
        accelerator: 'Command+A',
        selector: 'selectAll:'
      },
      {
        label: 'Quit App',
        accelerator: 'Command+Q',
        selector: 'terminate:'
      },
      {
        label: 'Toggle DevTools',
        accelerator: 'Alt+Command+I',
        click: function () { mb.window.toggleDevTools() }
      }
    ]
  }
]

mb.app.on('will-quit', function () {
  globalShortcut.unregisterAll()
})

mb.on('ready', function ready () {
  var menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)

  var window = mb.window;
  // window.openDevTools();
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

  ipc.on('quit',function () {
    mb.app.terminate()
  })

  ipc.on('open-config',function () {
    shell.showItemInFolder(path.join(mb.app.getPath('userData'), 'library.gifwit'))
  })

  mb.on('show', function () {
    window.webContents.send('show');
  });

    // Register a 'ctrl+shift+space' shortcut listener.
  var ret = globalShortcut.register('ctrl+shift+space', function () {
    mb.window.isVisible() ? mb.hideWindow() : mb.showWindow()
  })

});
