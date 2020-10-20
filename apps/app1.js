const lifewheel = require("../core/lifewheel")

function init() {
  var canvasElement = document.getElementById("theCanvas");
  var wheel = new lifewheel.Lifewheel()
  wheel.geometry.centerX = canvasElement.width / 2;
  wheel.geometry.centerY = canvasElement.height / 2;
  wheel.model.slices[0].label = "ABC";
  wheel.model.slices[1].label = "123";
  wheel.model.slices[0].value = 5;
  wheel.model.slices[1].value = 9;
  wheel.render(canvasElement.getContext("2d"))
}

// Wait for page to load.
function whenPageLoaded(callback) {
  if (document.readyState != "loading") {
    // The document is already loaded.
    callback();
  }
  else if (document.addEventListener) {
    // Modern browsers support DOMContentLoaded.
    document.addEventListener("DOMContentLoaded", callback);
  }
  else {
    // Old browsers don't.
    document.attachEvent("onreadystatechange", function() {
      if (document.readyState == "complete") {
        callback();
      }
    })
  }
}

// Main.
whenPageLoaded(init)
