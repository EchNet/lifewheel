/*
 *
 */
function PdfSurface(pdfdoc) {

  // Maintain a current point.
  var refx = 0;
  var refy = 0;

  function moveTo(x, y) {
    refx = x;
    refy = y;
    pdfdoc.moveTo(refx, refy)
  }

  function moveBy(distance, angle) {
    moveTo(refx + distance * Math.cos(angle), refy + distance * Math.sin(angle));
  }

  function lineTo(x, y) {
    refx = x;
    refy = y;
    pdfdoc.lineTo(refx, refy)
  }

  function lineBy(distance, angle) {
    lineTo(refx + distance * Math.cos(angle), refy + distance * Math.sin(angle));
  }

  function arc(cx, cy, radius, angle1, angle2) {
    refx = cx + radius * Math.cos(angle2);
    refy = cy + radius * Math.sin(angle2);

    var startX = cx + radius * Math.cos(angle1);
    var startY = cy + radius * Math.sin(angle1);
    var endX = cx + radius * Math.cos(angle2);
    var endY = cy + radius * Math.sin(angle2);
    var arcAngle = angle2 - angle1;
    while (arcAngle > 2*Math.PI) { arcAngle -= Math.PI; }
    while (arcAngle < 0) { arcAngle += Math.PI; }
    var largeArc = false;
    var anticlockwise = angle1 > angle2;
    var path = "M "+startX+","+startY+" A "+radius+","+radius+" 0 "+(largeArc?"1":"0")+","+(anticlockwise?"0":"1")+" "+endX+","+endY;
    pdfdoc.path(path)
  }

  function openFilledShape(fill) {
    pdfdoc.fillColor(fill)
  }

  function closeFilledShape() {
    pdfdoc.fill()
  }

  function openStroke(width, color) {
    pdfdoc.lineWidth(width)
    pdfdoc.strokeColor(color)
  }

  function closeStroke() {
    pdfdoc.stroke()
  }

  function drawArcedText(text, color, size, family, cx, cy, radius, angle) {
    pdfdoc.save()
    pdfdoc.fillColor(color)
    pdfdoc.fontSize(size)
    var x = 140;
    var y = 40;
    pdfdoc.moveTo(cx, cy)
    pdfdoc.rotate(45)
    //pdfdoc.rotate((angle * 180 / Math.PI) + 180)
    //var x = cx + radius * Math.cos(angle)
    //var y = cy + radius * Math.sin(angle)
    pdfdoc.text(text, x, y)
    pdfdoc.restore()
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

module.exports = PdfSurface;
