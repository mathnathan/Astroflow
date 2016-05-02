var path = require('path')
var fs = require('fs')
var exec = require('child_process').exec

const electron = require('electron');
// We can listen to messages from the renderer here:
const ipcMain = electron.ipcMain;
var webContents;

var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.

// Report crashes to our server.
//electron.crashReporter.start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  //if (process.platform != 'darwin') {
    app.quit();
  //}
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    minWidth: 600,
    minHeight: 200,
    'accept-first-mouse': true,
    //'title-bar-style': 'hidden'
  });

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/../client/index.html');

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  webContents = mainWindow.webContents;

  // open links in user's default browser
  webContents.on('new-window', function(e, url) {
    e.preventDefault();
    require('shell').openExternal(url);
  });

  // TODO: Turn this off in production
  webContents.openDevTools();


  // COMMUNICATION with the renderer (client)
  webContents.on('did-finish-load', function() { // built-in event

    // We know the webpage is loaded, so we can start interacting with it now
    ipcMain.on('load-file', function(event, file) {
      // arguments is everything the function gets, whether you named it or not
      //console.log("arguments:", arguments)
      console.log("file:", file.name, file.path)

      exec('ls -lah ' + file.path, function(err, stdout, stderr) {
        console.log("stdout:", stdout)
        webContents.send('test-event-response', stdout)
      })
    });


    // we also let the client know we're done setting up
    webContents.send('server-ready', "ready")
  });
});
