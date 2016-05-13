var path = require('path')
var fs = require('fs')
var exec = require('child_process').exec
var spawn = require('child_process').spawn

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

var killCommand = 'SIGKILL'
// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  //if (process.platform != 'darwin') {
  if(child) child.kill(killCommand);
  setTimeout(function() {
    console.log("quiting")
    app.quit();
  }, 300)
  //}
});

// we keep track of the child process globally so we can kill it
var child;
app.on('will-quit', function() {
  console.log("still quitting", !!child)
  if(child) child.kill(killCommand);
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    minWidth: 600,
    minHeight: 200,
    'acceptFirstMouse': true,
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

      /*
      exec('ls -lah ' + file.path, function(err, stdout, stderr) {
        console.log("ls on inputFile:", stdout)
        console.log("file.name = ", file.name)
        console.log("file.path = ", file.path)
        webContents.send('test-event-response', stdout)
      })
      */

      /*
      exec('file bin/routes', function(err, stdout, stderr) {
        console.log("ls on flask server:", stdout)
        webContents.send('test-event-response', stdout)
      })
      */

      if(child) child.kill(killCommand);
      console.log("running server", file.path)
      /*
      child = exec('bin/routes ' + file.path, function(err, stdout, stderr) {
        // TODO: for some reason this doesn't always fire on the first run
        console.log("stderr: \n", stderr)
        console.log("running flask server on file: \n", stdout)
      })
      */
      child = spawn('bin/routes', [file.path])
      child.stdout.on('data', function(data) {
        console.log(`${data}`)
      })
      child.stderr.on('data', function(data) {
        var str = `${data}`; // not sure why this converts from buffer to string
        // TODO: not sure why everything comes in on stderr intsead of stdout
        console.log(str)
        if(str.indexOf('Running on') >= 0) {
          setTimeout(function() {
            webContents.send('server-started')
          }, 500)
        }
      })
      child.on('close', function(code) {
        console.log("child closed with code", code)
      })
    });
    // we also let the client know we're done setting up
    webContents.send('server-ready', "ready")
  });
});
