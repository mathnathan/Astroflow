var path = require('path')
var d3 = require('d3');
var ipc = require("electron").ipcRenderer

console.log("loaded")
ipc.on("server-ready", ready)

function ready() {
  // all of our UI code will begin executing here.
  // it's fine to define functions outside of this ready function,
  // but we don't want anything to happen until the server is good to go

  // wire up the file handling
  var inputElement = document.getElementById("new-file");
  inputElement.addEventListener("change", handleFile, false);
  // enable drag-and-drop of files onto the window
  var dropZone = document.body;
  dropZone.addEventListener('dragover', handleFileDrag, false);
  dropZone.addEventListener('drop', handleFile, false);
}

// when a file is selected (or dropped on the app) we process it
function handleFile(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  var files = this.files
  if(!files && evt.dataTransfer) files = evt.dataTransfer.files

  console.log("handled", files)
  if(!files[0]) return; // TODO: error

  var file = files[0];
  // we tell the server about the file
  // (but we don't actually process it in the client)
  ipc.send("load-file", {name: file.name, path: file.path})
}
// this function gets called when the user drags a file over
function handleFileDrag(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

ipc.on("test-event-response", function() {
  console.log("response:")
  console.log(arguments)
})
