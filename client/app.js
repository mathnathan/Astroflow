var path = require('path')
var d3 = require('d3');
var ipc = require("electron").ipcRenderer

console.log("loaded")
ipc.on("server-ready", ready)

function ready() {
  ipc.send("test-event", "hellooooo")

}

ipc.on("test-event-response", function() {
  console.log("response:")
  console.log(arguments)
})
