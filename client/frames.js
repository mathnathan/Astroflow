// UI for dealing with individual frames
var framesWidth = width + 100;
// this function will be called when metadata is returned so we can choose frames
function renderFramesUI() {
  console.log("rendering frames ui", META)
  var frameIndices = d3.range(META.frames)
  var bw = framesWidth / META.frames;

  var bars = d3.select("#frame-bars").selectAll("div.bar")
    .data(frameIndices)
  bars.enter().append("div").classed("bar", true)
  bars.style({
    width: Math.max(bw,1) + "px",
    left: function(d) { return d * bw + "px"; }
  })
  .on("mouseover", function(d) {
    getFrame(d);
  })
  .on("click", function(d) {
    //getFrame(d)
  })

  d3.select("#average-button")
    .on("click", function(d) {
      // we reset the global state of the current frame to the average when the
      // user leaves the frame bars area
      currentFrame = average;
      currentIndex = "Average"
      renderFrame();
    })
}


function renderFlux() {
  var frameIndices = d3.range(META.frames)
  var bw = framesWidth / META.frames;

  var extent = d3.extent(flux)
  var fluxScale = d3.scale.linear()
    .domain(extent)
    .range([0, 75])

  var line = d3.svg.line()
    .x(function(d,i) { return i * bw })
    .y(function(d,i) { return fluxScale(d) })

  var fluxg = d3.select("g#flux");
  var fluxline = fluxg.selectAll("path.flux")
    .data([flux])
    
  fluxline.enter().append("path").classed("flux", true)
  fluxline.attr({
    d: function(d) { return line(d) }
  })


}
