const Lifewheel = require("../core/lifewheel")
const PdfSurface = require("../core/pdfsurface")
const PDFDocument = require("pdfkit")
const BlobStream = require("blob-stream")

function init() {
  var canvasElement = document.getElementById("theCanvas")
  var wheel = new Lifewheel()
  wheel.geometry.radius = 150;
  wheel.geometry.centerX = 320;
  wheel.geometry.centerY = 320;
  wheel.model.slices[0].label = "ABC";
  wheel.model.slices[1].label = "123";
  wheel.model.slices[0].value = 5;
  wheel.model.slices[1].value = 9;

  const pdfdoc = new PDFDocument()
  const stream = pdfdoc.pipe(BlobStream())
  wheel.render(new PdfSurface(pdfdoc))
  pdfdoc.end()
  stream.on("finish", function() {
    const url = stream.toBlobURL("application/pdf")
    var iframe = document.getElementById("theIframe")
    iframe.src = url;
  })
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

