var kb = require('./keybinding')




// UI for dealing with individual frames
var framesWidth = width + 230;

d3.select("#frames").on("mousemove", function() {
  var x = d3.mouse(this)
  renderGuide(x[0])
})

function renderGuide(x) {
  //var y = d3.event.y
  var frameScale = d3.scale.linear()
  .domain([0, META.frames])
  .range([0, framesWidth])

  var frame = Math.floor(frameScale.invert(x))
  console.log(x, frame)

  // draw a little guiding line behind everything
  d3.select("line.guide").attr({
    x1: x,
    x2: x,
    y1: 0,
    y2: 125,
    stroke: '#fff',
  })
  dx = -15
  if(frame < 10) dx = 5;
  if(frame > META.frames - 10) dx = -25;
  d3.select("text.guide").text(frame)
  .attr({
    dx: dx,
    x: x,
    y: 60,
  })

  renderInfoPanel(frame);
}

function renderInfoPanel(frame) {
  var ip = d3.select("#info-panel")
  ip.select("span.frame").text(frame)
  ip.select("span.flux").text(flux[frame])
  // TODO: loop thru the hotspots and grab what we need when it matches frame
}

// this function will be called when metadata is returned so we can choose frames
function renderFramesUI() {
  console.log("rendering frames ui", META)
  var frameIndices = d3.range(META.frames)
  var bw = framesWidth / META.frames;
  var xScale = d3.scale.linear()
    .domain([0, META.frames])
    .range([0, framesWidth])


  var bars = d3.select("#frame-bars").selectAll("div.bar")
    .data(frameIndices)
  bars.enter().append("div").classed("bar", true)
  bars.style({
    width: Math.max(bw,1) + "px",
    left: function(d) { return xScale(d) + "px"; }
  })
  .on("mouseover", function(d) {
    //console.log("frame", d)
    //renderGuide(xScale(d))
  })
  .on("click", function(d) {
    getFrame(d);
  })

  d3.select("#average-button")
    .on("click", function(d) {
      // we reset the global state of the current frame to the average when the
      // user leaves the frame bars area
      currentFrame = average;
      currentIndex = "Average"
      renderFrame();
    })

  d3.select("body").call( d3.keybinding()
    .on('arrow-left', function() {
      if(currentIndex !== "Average") {getFrame(currentIndex-1)}
    })
    .on('arrow-right', function () {
      if(currentIndex !== "Average") {getFrame(currentIndex+1)}
    })
  );
}


function renderFlux(start, stop) {
  var frameIndices = d3.range(META.frames)
  var bw = framesWidth / META.frames;

  // flux is a global variable
  var extent = d3.extent(flux)
  var fluxScale = d3.scale.linear()
    .domain(extent)
    .range([0, 50])

  d3.select("line.zero").attr({
    x1: 0,
    x2: framesWidth,
    y1: fluxScale(0),
    y2: fluxScale(0)
  })

  var line = d3.svg.line()
    .x(function(d,i) { return i+start * bw })
    .y(function(d,i) { return fluxScale(d) })

  var fluxg = d3.select("g#flux");
  var fluxline = fluxg.selectAll("path.flux")
    .data([flux])

  fluxline.enter().append("path").classed("flux", true)
  fluxline.attr({
    d: function(d) { return line(d) }
  })


}


function renderHotspots(start, stop) {
  // hotspots is a global variable;
  var spots = d3.nest()
    .key(function(d) { return d.frame })
    .rollup(function(leaves) {
      var use;
      var maxConfidence = 0;
      leaves.forEach(function(leaf) {
        if(leaf.confidence > maxConfidence) {
          maxConfidence = leaf.confidence;
          use = leaf;
        }
      })
      return use;
    })
    .entries(hotspots)

  var bw = framesWidth / META.frames;

  var maxConfidence = d3.max(spots, function(d) { return d.values.confidence });
  var heightScale = d3.scale.linear()
    //.domain([0, maxConfidence])
    .domain([0, 1])
    .range([0, 75])

  var maxStrength = d3.max(spots, function(d) { return d.values.confidence });
  var strengthScale = d3.scale.linear()
    .domain([0, maxStrength])
    .range(["#ccc", "#fff"])

  d3.select("#hotspots").attr("transform", "translate(0, 50)")
  var bars = d3.select("#hotspots").selectAll("rect.spot")
    .data(spots)
  bars.enter().append("rect").classed("spot", true)
  bars.style({
    width: Math.max(bw,1),
    height: function(d) { return heightScale(d.values.confidence ) },
    x: function(d) { return +d.key * bw },
    y: function(d) { return 75 - heightScale(d.values.confidence ) },
    fill: function(d) { return strengthScale(d.values.strength )}
  })
  .on("mouseover", function(d) {
    console.log("spot frame", d)
  })
  .on("click", function(d) {
    //getFrame(d);
  })


}
