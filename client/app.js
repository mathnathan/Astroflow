var path = require('path')
var ipc = require("electron").ipcRenderer
var request = require('request')
var d3 = require('d3')
var simplify = require('./simplify')

console.log("loaded")
ipc.on("server-ready", ready)

var URL = 'http://localhost:5000/';

var width = 600;
var height = 600;

var META = {};

// global state controling if we are drawing or not
var drawing;
var tx = 0;
var ty = 0;
var scale = 1;
// path related variables
var pathX = [];
var pathY = [];
var tanX = []
var tanY = [];
var flowX = []
var flowY = []
// we cache our frames and average globally
var frameCache = {};
var average;
var currentFrame;
var currentIndex = "Average";
var flux = []
var hotspots = [];

var canvas, ctx;
var curvectx;

// Global variable for slicing. Will be accessible to user and all functions should
// use them
var start = 0;
var stop = -1;

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

  canvas = d3.select("#frame").node();
  ctx = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;

  var curvecanvas = d3.select("#curve").node();
  curvecanvas.width = width;
  curvecanvas.height = height;
  curvectx = curvecanvas.getContext('2d');

  d3.select("#draw-button").on("click", function() {
    drawing = !drawing;
    var button = d3.select(this)
      .classed("active", drawing)
      .text(function() {
        if(drawing) return "Drawing";
        return "Draw";
      })
    d3.select("#frame").classed("Drawing", drawing)
  })

  var zoom = d3.behavior.zoom()
    //.center([width/2, height/2])
    .scaleExtent([0.5, 20])
    .on("zoomstart", function() {
      if(drawing) {
        pathX = []
        pathY = []
      }
    })
    .on("zoom", function() {
      if(drawing) {
        var x = d3.event.sourceEvent.layerX - tx;
        var y = d3.event.sourceEvent.layerY - ty;
        pathX.push(x/scale)
        pathY.push(y/scale)
        renderCurve();
      } else {
        tx = d3.event.translate[0];
        ty = d3.event.translate[1];
        scale = d3.event.scale;
        renderFrame()
      }
    })
    .on("zoomend", function() {
      if(drawing) {
        //console.log("path", pathX, pathY)
        console.log("done drawing")
        drawing = false;

        d3.select("#draw-button")
          .classed("active", drawing)
          .text(function() {
            if(drawing) return "Drawing";
            return "Draw";
          })
        d3.select("#frame").classed("Drawing", drawing)

        var points = []
        pathX.forEach(function(x,i) {
          var y = pathY[i]
          points.push({x:x, y:y})
        })
        // the 2nd argument is a threshold, a value of 1 won't simplify
        // bigger number means more aggressive simplifying
        var simplified = simplify(points, 0.3)
        pathX = []
        pathY = []
        simplified.forEach(function(p) {
          pathX.push(p.x)
          pathY.push(p.y)
        })
        renderCurve();
        console.log("simplified", simplified)
        getFlux();
        getHotspots();
      }
    })

  d3.select("#frame").call(zoom)
    .on("mousemove", function () {
      coordinates = d3.mouse(this);
      var x = ((coordinates[0] - tx) / scale)/width * META.xdim;
      var y = ((coordinates[1] - ty) / scale)/width * META.ydim;
      var loc = "("+x.toFixed(1)+", "+y.toFixed(1)+")";
      d3.select("#mouse-location").text(loc);})
    .on("mouseenter", function () {
      d3.select("#mouse-location").classed("hidden", false);})
    .on("mouseleave", function () {
      d3.select("#mouse-location").classed("hidden", true);
    });

  d3.select("#slice-begin").on("input", handleSliceBegin).on("blur", function() {
    d3.select("#slice-begin").property("value", start);
  });
  d3.select("#slice-end").on("input", handleSliceEnd).on("blur", function() {
    d3.select("#slice-end").property("value", stop);
  });

  d3.select("#calcFlux-button").on("click", getFlux);
  d3.select("#findHotspots-button").on("click", getHotspots);
}

function handleSliceBegin() {
  console.log("this.value = ", this.value);
  console.log("typeof this.value = ", typeof this.value);
  console.log("Number(this.value) = ", Number(this.value));
  console.log("typeof Number(this.value) = ", typeof Number(this.value));
  begin = Number(this.value);
  if (isNaN(begin)) console.log("IS NAN!");
  if (begin < 0 || isNaN(begin)) {
    start = 0;
  } else if (begin >= stop) {
    start = stop-1;
  } else {
    start = begin;
  }
  console.log("start = ", start);
  console.log("stop = ", stop);
  d3.select("#slice-end").attr("min", start+1);
}

function handleSliceEnd(newVal) {
  console.log("this.value = ", this.value);
  end = Number(this.value);
  if (end >= META.frames || isNaN(end)) {
    stop = META.frames-1;
  } else if (end <= start) {
    stop = start+1;
  } else {
    stop = end;
  }
  console.log("start = ", start);
  console.log("stop = ", stop);
  d3.select("#slice-begin").attr("max", stop-1);
}

function renderFrame() {
  var data = currentFrame;
  d3.select("#title").text(currentIndex)

  var min = d3.min(data, function(row) {
    return d3.min(row)
  })
  var max = d3.max(data, function(row) {
    return d3.max(row)
  })
  console.log("min, max", min,max);

  canvas.width = width;
  canvas.height = height;
  var rw = width/ META.xdim
  var rh = height / META.ydim

  ctx.clearRect(0, 0, width, height)

  var colorScale = d3.scale.linear()
    .domain([min, max])
    .range(["#253494", "#ffffcc"])

  for(var j = 0; j < data.length; j++) {
    var row = data[j];
    for(var i = 0; i < row.length; i++) {
      var d = row[i];
      ctx.fillStyle = colorScale(d);
      ctx.fillRect(tx + i * rw * scale, ty + j * rh * scale, Math.ceil(rw * scale), Math.ceil(rh * scale))
    }
  }
  renderCurve();
}

function renderCurve() {
  curvectx.clearRect(0, 0, width, height)
  curvectx.strokeStyle = "rgba(240, 20, 20, 0.6)";
  curvectx.fillStyle = "rgba(240, 20, 20, 0.2)";

  curvectx.beginPath();
  //curvectx.moveTo(tx + pathX[0] * scale, ty + pathY[1] * scale);
  pathX.forEach(function(x, i) {
    var y = pathY[i];
    curvectx.lineTo(tx + x * scale, ty + y * scale)
    curvectx.stroke();
  });

  pathX.forEach(function(x, i) {
    var y = pathY[i];
    curvectx.beginPath();
    curvectx.arc(tx + x * scale, ty + y * scale, 3, 0, Math.PI*2)
    curvectx.fill();
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
  d3.select("title").text("Astroflow: " + file.name)
}

// this function gets called when the user drags a file over
function handleFileDrag(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}


function getMetadata(callback) {
  d3.json(URL + "getMetadata", function(err, meta) {
    console.log("meta", meta)
    META.frames = meta.frames
    META.xdim = meta.xdim
    META.ydim = meta.ydim
    callback();
    renderFramesUI();
  })
}

function getFrame(i) {
  console.log("get frame", i)
  if(frameCache[i]) {
    currentFrame = frameCache[i].frame;
    currentIndex = i;
    renderFrame()
  } else {
    d3.json(URL + "getFrame?i=" + i, function(err, frame) {
      console.log("frame", frame)
      frameCache[i] = frame
      currentFrame = frame.frame;
      currentIndex = i;
      renderFrame()
    })
  }
}

function getAverage(callback) {
  d3.json(URL + "getAverage", function(err, frame) {
    console.log("frame", frame)
    average = frame.average
    currentFrame = average;
    currentIndex = "Average";
    renderFrame()
    callback(frame)
  })
}

function getFlux() {
  if(pathX.length >= 4 && pathY.length >= 4) { // Ensure a path has been collected
    var dataX = []
    var dataY = []
    pathX.forEach(function(x) { dataX.push(x/width * META.xdim)})
    pathY.forEach(function(y) { dataY.push(y/width * META.ydim)})
    var options = {
      uri: URL + "calcFlux",
      method: 'POST',
      json: { "beg": start, "end": stop, "path": [dataX, dataY]}
    };

    d3.select("#flux-button").text("LOADING Flux")
    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
      } else {
        console.log("error", error);
      }
      d3.select("#flux-button").text("Calculate Flux")
      // node convention is to allways put error as first argument, and pass null if no error
      // the body is the JSON payload we want
      //console.log("body = ", body);
      flux = body.flux;
      //console.log("flux = ", flux);
      renderFlux(start, stop);
    });
  }
}

function getHotspots() {
  if(pathX.length >= 4 && pathY.length >= 4) { // Ensure a path has been collected
    var dataX = []
    var dataY = []
    pathX.forEach(function(x) { dataX.push(x/width * META.xdim)})
    pathY.forEach(function(y) { dataY.push(y/width * META.ydim)})
    var options = {
      uri: URL + "findHotspots",
      method: 'POST',
      json: { "beg": start, "end": stop, "path": [dataX, dataY]}
    };

    d3.select("#hotspots-button").text("LOADING Hotspots")

    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
      } else {
        console.log("error", error);
      }
      // node convention is to allways put error as first argument, and pass null if no error
      // the body is the JSON payload we want
      d3.select("#hotspots-button").text("Find Hotspots")
      console.log("hotspots", body);
      hotspots = processHotspots(body);
      renderHotspots(start, stop);
    });
  }
}

function processHotspots(results) {
  var arrays = results.hotspots
  var n = arrays[0].length;
  var spots = [];
  for(var i = 0; i < n; i++) {
    var frame = arrays[0][i]
    var pointIndex = arrays[1][i];
    var spot = {
      frame: frame,
      point: {
        x: results.pathPts[0][pointIndex],
        y: results.pathPts[1][pointIndex],
      },
      slope: arrays[2][i],
      nzero: arrays[3][i],
      strength: arrays[4][i],
      confidence: arrays[5][i]
    }
    spots.push(spot)
  }
  return spots;
}

ipc.on("server-started", function() {
  console.log("server started!")
  getMetadata(function() {
    start = 0;
    stop = META.frames-1;
    d3.select("#slice-begin")
      .attr("value", start)
      .attr("max", META.frames-2);
    d3.select("#slice-end")
      .attr("value", stop)
      .attr("max", stop);
  });
  getAverage(function() {
    d3.select("#analysis").classed("hidden", false)
    d3.select("#frames").classed("hidden", false)
    d3.select("#loading").classed("hidden", true)
  });
  //getFrame(0)
});

ipc.on("test-event-response", function() {
  console.log("response:")
  console.log(arguments)
})
