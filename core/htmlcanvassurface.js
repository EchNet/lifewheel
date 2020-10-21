/*
 *
 */
function HtmlCanvasSurface(canvas) {
  var context = canvas.getContext("2d")

  // Maintain a current point.
  var refx = 0;
  var refy = 0;

  function moveTo(x, y) {
    refx = x;
    refy = y;
    context.moveTo(refx, refy)
  }

  function moveBy(distance, angle) {
    moveTo(refx + distance * Math.cos(angle), refy + distance * Math.sin(angle));
  }

  function lineTo(x, y) {
    refx = x;
    refy = y;
    context.lineTo(refx, refy)
  }

  function lineBy(distance, angle) {
    lineTo(refx + distance * Math.cos(angle), refy + distance * Math.sin(angle));
  }

  function arc(cx, cy, radius, angle1, angle2) {
    refx = cx + radius * Math.cos(angle2);
    refy = cy + radius * Math.sin(angle2);
    context.arc(cx, cy, radius, angle1, angle2)
  }

  function openFilledShape(fill) {
    context.fillStyle = fill;
    context.beginPath()
  }

  function closeFilledShape() {
    context.closePath()
    context.fill()
  }

  function openStroke(width, color) {
    context.beginPath()
    context.lineWidth = width;
    context.strokeStyle = color;
  }

  function closeStroke() {
    context.stroke()
  }

  function drawArcedText(text, color, size, family, cx, cy, radius, angle) {
    context.save()
    context.fillStyle = color;
    context.textAlign = "center";
    context.font = size + "px " + family;
    var x = cx + radius * Math.cos(angle)
    var y = cy + radius * Math.sin(angle)
    context.translate(x, y)
    context.rotate(angle + Math.PI/2)
    context.fillText(text, 0, 0)
    context.restore()
  }

  Object.assign(this, {
    moveTo: moveTo,
    moveBy: moveBy,
    lineTo: lineTo,
    lineBy: lineBy,
    arc: arc,
    openFilledShape: openFilledShape,
    closeFilledShape: closeFilledShape,
    openStroke: openStroke,
    closeStroke: closeStroke,
    drawArcedText: drawArcedText
  })
}

module.exports = HtmlCanvasSurface;
