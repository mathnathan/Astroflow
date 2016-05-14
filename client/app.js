var path = require('path')
var d3 = require('d3')
var ipc = require("electron").ipcRenderer
var request = require('request')

console.log("loaded")
ipc.on("server-ready", ready)

var PATH = [[167.158203, 167.158203, 167.158203, 167.158203, 167.158203, 167.158203, 167.158203, 167.158203, 167.158203, 167.158203, 167.158203, 167.158203, 167.158203, 167.158203, 167.288086, 167.417969, 167.547852, 167.547852, 167.547852, 167.547852, 167.677734, 167.677734, 167.807617, 167.807617, 167.807617, 167.807617, 167.807617, 167.807617, 167.807617, 167.807617, 167.807617, 168.067383, 168.067383, 168.067383, 168.067383, 168.067383, 168.197266, 168.197266, 168.197266, 168.197266, 168.197266, 168.197266, 168.197266, 168.197266, 168.197266, 168.197266, 168.197266, 168.197266, 168.197266, 168.197266, 168.197266, 168.197266, 168.197266, 168.197266, 168.197266, 168.197266, 168.197266, 168.197266, 168.197266, 168.197266, 168.197266, 168.197266, 168.197266, 168.197266, 168.327148, 168.327148, 168.327148, 168.457031, 168.586914, 168.716797, 168.716797, 168.716797, 168.846680, 168.976562, 168.976562, 168.976562, 169.106445, 169.106445, 169.366211, 169.366211, 169.366211, 169.366211, 169.366211, 169.496094, 169.496094, 169.496094, 169.496094, 169.496094, 169.496094, 169.625977, 169.625977, 169.625977, 169.625977, 169.755859, 169.755859, 169.755859, 169.755859, 169.755859, 169.755859, 169.755859, 170.015625, 170.015625, 170.015625, 170.015625, 170.015625, 170.015625, 170.015625, 170.015625, 170.015625, 170.015625, 170.015625, 170.015625, 170.015625, 169.885742, 169.885742, 169.755859, 169.755859, 169.625977, 169.366211, 169.236328, 169.236328, 169.106445, 168.976562, 168.976562, 168.716797, 168.586914, 168.457031, 168.457031, 168.327148, 168.327148, 168.197266, 168.067383, 168.067383, 167.937500, 167.937500, 167.807617, 167.807617, 167.807617, 167.677734, 167.677734, 167.417969, 167.417969, 167.288086, 167.288086, 167.288086, 167.158203, 167.158203, 167.158203, 167.158203, 167.158203, 167.028320, 167.028320, 167.028320, 166.638672, 166.508789, 166.508789, 166.508789, 166.508789, 166.508789, 166.508789, 166.378906, 166.378906, 166.378906, 166.378906, 166.249023, 166.119141, 165.989258, 165.989258, 165.989258, 165.989258, 165.859375, 165.859375, 165.859375, 165.859375, 165.859375, 165.859375, 165.859375, 165.859375, 165.859375, 165.859375, 165.859375, 165.729492, 165.729492, 165.469727, 165.339844, 165.469727],[108.446940, 108.576823, 108.706706, 108.836589, 108.966471,   109.226237, 109.356120, 109.486003, 109.615885, 109.875651, 110.005534, 110.135417, 110.265299, 110.525065, 110.784831, 110.914714, 111.044596, 111.174479, 111.304362, 111.434245, 111.694010, 111.823893, 112.083659, 112.213542, 112.473307, 112.603190, 112.733073, 112.862956, 113.122721, 113.252604, 113.382487, 113.642253, 113.772135, 113.902018, 114.031901, 114.161784, 114.551432, 114.681315, 114.811198, 115.070964, 115.200846, 115.330729, 115.460612, 115.720378, 115.850260, 115.980143, 116.110026, 116.369792, 116.499674, 116.629557, 116.759440, 117.019206, 117.149089, 117.278971, 117.408854, 117.798503, 117.928385, 118.058268, 118.318034, 118.447917, 118.577799, 118.707682, 118.967448, 119.097331, 119.357096, 119.616862, 119.746745, 119.876628, 120.136393, 120.266276, 120.396159, 120.526042, 120.785807, 121.045573, 121.175456, 121.305339, 121.694987, 121.824870, 122.084635, 122.214518, 122.344401, 122.474284, 122.604167, 122.734049, 122.863932, 122.993815, 123.123698, 123.253581, 123.513346, 123.643229, 123.773112, 123.902995, 124.162760, 124.292643, 124.422526, 124.552409, 124.812174, 124.942057, 125.071940, 125.201823, 125.461589, 125.591471, 125.721354, 125.851237, 126.111003, 126.240885, 126.370768, 126.500651, 126.760417, 126.890299, 127.020182, 127.150065, 127.409831, 127.539714, 127.669596, 127.799479, 128.059245, 128.189128, 128.448893, 128.708659, 128.838542, 128.968424, 129.098307, 129.358073, 129.617839, 129.747721, 129.877604, 130.007487, 130.137370, 130.267253, 130.397135, 130.527018, 130.656901, 130.786784, 130.916667, 131.046549, 131.306315, 131.436198, 131.566081, 131.695964, 131.955729, 132.085612, 132.345378, 132.605143, 132.864909, 132.994792, 133.254557, 133.384440, 133.514323, 133.644206, 133.903971, 134.033854, 134.163737, 134.423503, 134.553385, 134.683268, 134.813151, 134.943034, 135.072917, 135.202799, 135.332682, 135.462565, 135.592448, 135.852214, 135.982096, 136.111979, 136.241862, 136.501628, 136.761393, 136.891276, 137.151042, 137.280924, 137.410807, 137.540690, 137.800456, 137.930339, 138.060221, 138.190104, 138.449870, 138.579753, 138.709635, 138.839518, 139.099284, 139.359049, 139.488932, 139.618815]];
var URL = 'http://localhost:5000/';

var META = {};

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

  // Button for finding hotspots 
  var findHotspots = document.getElementById("find-hotspots");
  findHotspots.addEventListener('click', handleHotspots, false);

  d3.select("#test-frame").on("click", function() {
    getFrame(0);
  })
  d3.select("#test-flow").on("click", function() {

  })
}

function handleHotspots(error, hotspots) {

  var options = {
    uri: URL + "findHotspots",
    method: 'POST',
    json: { "path": PATH }
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
    } else {
      console.log("error = ", error);
    }
    // node convention is to allways put error as first argument, and pass null if no error
    // the body is the JSON payload we want
    console.log("Button Clicked!");
    console.log("hotspots", body);
  });

}


// http://localhost:5000/findHotspots
// http://localhost:5000/calcFlux

function getFrame(i) {
  console.log("get frame", i)
  d3.json(URL + "getFrame?i=" + i, function(err, frame) {
    console.log("frame", frame)
    renderFrame(frame.frame)
  })
}

function getAverage(callback) {
  d3.json(URL + "getAverage", function(err, frame) {
    console.log("frame", frame)
    renderFrame(frame.average)
    callback(frame)
  })
}

function renderFrame(data) {
  var canvas = d3.select("#frame").node()
  var ctx = canvas.getContext('2d');

  var min = d3.min(data, function(row) {
    return d3.min(row)
  })
  var max = d3.max(data, function(row) {
    return d3.max(row)
  })
  console.log("min, max", min,max);

  var width = 500;
  var height = 500;
  canvas.width = width;
  canvas.height = height;
  var rw = width/ META.xdim
  var rh = height / META.ydim

  ctx.clearRect(0, 0, width, height)

  var colorScale = d3.scale.linear()
    .domain([min, max])
    .range(["#253494", "#ffffcc"])

  data.forEach(function(row, j) {
    row.forEach(function(d, i) {
      ctx.fillStyle = colorScale(d);
      ctx.fillRect(i * rw, j * rh, rw, rh)
    })
  })
}


// when a file is selected (or dropped on the app) we process it
function handleFile(evt) {
  d3.select("#loading").classed("hidden", false)
  d3.select("#instructions").classed("hidden", true)
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


function getMetadata() {
  d3.json(URL + "getMetadata", function(err, meta) {
    console.log("meta", meta)
    META.frames = meta.frames
    META.xdim = meta.xdim
    META.ydim = meta.ydim
  })
}

ipc.on("server-started", function() {
  console.log("server started!")
  getMetadata();
  getAverage(function() {
    d3.select("#analysis").classed("hidden", false)
    d3.select("#loading").classed("hidden", true)
  });
  //getFrame(0)
});

ipc.on("test-event-response", function() {
  console.log("response:")
  console.log(arguments)
})
