const {dialogs,shell,ipcMain,clipboard,globalShortcut,Menu} = require('electron')

var fs = require('fs')
var path = require('path')
var menubar = require('menubar')

var mb = menubar({dir: __dirname + '/app', width: 300, preloadWindow: true})
mb.app.commandLine.appendSwitch('--disable-gpu')

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

mb.on('after-create-window', function () {
  var filepath = path.join(mb.app.getPath('userData'), 'library.gifwit')

  mb.window.webContents.on('did-finish-load', function() {
    try {
      //test to see if settings exist
      fs.openSync(filepath, 'r+'); //throws error if file doesn't exist
      var data=fs.readFileSync(filepath); //file exists, get the contents
      mb.gifwit = JSON.parse(data); //turn to js object
      mb.window.webContents.send('data-added',mb.gifwit.images);
    } catch (err) {
      try {
        var fd = fs.openSync(filepath, 'w+');
        mb.gifwit = {version: 1,images:[]}
        console.log("Created gifwit library");
      } catch (err) {
        console.log("Error creating Library file: " + JSON.stringify(err));
        throw err;
      }
    }
  })
})

mb.on('ready', function ready () {
  var menu = Menu.buildFromTemplate(menuTemplate)
  var filepath = path.join(mb.app.getPath('userData'), 'library.gifwit')

  Menu.setApplicationMenu(menu)

  ipcMain.on('url-to-clipboard',function(data,returnVal) {
    clipboard.writeText(returnVal);
    mb.hideWindow();
  })

  ipcMain.on('quit',function () {
    mb.app.quit()
  })

  ipcMain.on('open-config',function () {
    shell.showItemInFolder(filepath)
  })

  ipcMain.on('add-to-library',function(data,returnVal) {
    mb.gifwit.images.push(returnVal)
    try {
      var fd = fs.openSync(filepath, 'w+');
      fs.writeSync(fd,JSON.stringify(mb.gifwit))
      console.log("Library update saved")
      mb.window.webContents.send('data-added',mb.gifwit.images);
    }
    catch (err) {
      console.log("Error saving library update")
      mb.window.webContents.send('save-error',err);
    }

  })

  ipcMain.on('remove-from-library',function(data,returnVal) {
    var canDelete = dialog.showMessageBox({type: "question",title:"Are you sure?",buttons: ["Yes","No"],message: "Are you sure you wan't to delete this image?"})

    if(canDelete == 0) {
      mb.gifwit.images = mb.gifwit.images.filter(function(image){
        return (image.url != returnVal && image)
      });

      try {
        var fd = fs.openSync(filepath, 'w+');
        fs.writeSync(fd,JSON.stringify(mb.gifwit))
        console.log("Library update saved")
        window.webContents.send('data-added',mb.gifwit.images);
      }
      catch (err) {
        console.log("Error saving library update")
        window.webContents.send('save-error',err);
      }
    } else {
      console.log("Not deleting")
    }

  })

  mb.on('show', function () {
    mb.window.webContents.send('show');
  });

    // Register a 'ctrl+shift+space' shortcut listener.
  var ret = globalShortcut.register('command+shift+g', function () {
    mb.window.isVisible() ? mb.hideWindow() : mb.showWindow()
  })

});
