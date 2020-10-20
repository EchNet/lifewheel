/**
 * Maintain state of a lifewheel and render it.
 * 
 * Built-in rendering supports HtmlCanvasContext2D and may be adapted to render to PDF or
 * other graphics-capable surface.
 */

const NSLICES = 8;  // A lifewheel is sliced radially into 8 slices of equal size.
const SLICE_ANGLE = (Math.PI * 2) / NSLICES;

function safeIndex(array, index, dflt) {
  try {
    return array[index];
  }
  catch (e) {
    return dflt;
  }
}

function mergeWheelOptions(o0, o1, o2) {
  const combinedSlices = []
  for (var i = 0; i < NSLICES; ++i) {
    combinedSlices.push(
      Object.assign({}, safeIndex((o1 || {}).slices, i), safeIndex((o2 || {}).slices, i)))
  }
  return Object.assign(o0, o1, o2, { slices: combinedSlices })
}

/*
 * A LifewheelModel describes the values contained by the wheel.
 *   Properties:
 *    (none yet)
 *   Children:
 *     A LifewheelModel includes a .slices array, size NSLICES, of elements that 
 *     describe the values pertinent to a particular slice.
 *      .label       The user-given name for the associated area.
 *      .value       The user-given satisfaction value for the associated area, usually an
 *                   integer, in range {x|0 <= x <= 10}
 */
function LifewheelModel(values) {
  mergeWheelOptions(this, LifewheelModel.defaultValues, values)
}
LifewheelModel.defaultValues = {
  slices: [
    { label: "", value: 0 },
    { label: "", value: 0 },
    { label: "", value: 0 },
    { label: "", value: 0 },
    { label: "", value: 0 },
    { label: "", value: 0 },
    { label: "", value: 0 },
    { label: "", value: 0 }
  ]
}
LifewheelModel.prototype.getLabel = function(index) {
  return safeIndex(this.slices, index, {}).label;
}
LifewheelModel.prototype.getValue = function(index) {
  var value = safeIndex(this.slices, index, {}).value;
  if (typeof value !== "number") return null;
  return Math.max(0, Math.min(10, value))
}

/*
 * A LifewheelGeometry describes the position and sizing of the wheel relative to the 2D
 * drawing surface.
 *   Properties:
 *    .centerX     X-coordinate of center point.
 *    .centerY     Y-coordinate of center point.
 *    .radius      Distance from the center point to any point on the outer edge.
 *    .rotation    Angle of rotation from base heading.  Base heading has the radius between
 *                 the first and 8th slices pointing to the right.  Increased angle rotates
 *                 the wheel counter-clockwise.
 */
function LifewheelGeometry(values) {
  mergeWheelOptions(this, LifewheelGeometry.defaultValues, values)
}
LifewheelGeometry.defaultValues = {
 centerX: 0,
 centerY: 0,
 radius: 256,
 rotation: 0
}

/*
 * A LifewheelStyles specifies the colors, line styles, and text styles to use in rendering
 * the wheel.  All line widths are expressed as fractions of the wheel's radius.
 *   Properties:
 *    .fontFamily             Default font family for all text rendered inside the wheel.
 *    .outlineWidth           The width of the outer border line.
 *    .outlineColor           The color of the outer border line.
 *    .radialDividerWidth     The width of the radial divider lines (all 8).
 *    .radialDividerColor     The color of the radial divider lines (all 8).
 *    .rimDividerWidth        The width of the circular line that divides the outer rim,
 *                            where labels are rendered, from the inner circle. 
 *    .rimDividerColor        The color of the " " " " " ....
 *   Children:
 *     A LifewheelStyles includes a .slices array, size NSLICES, of elements that
 *     describe the styles pertinent to a particular slice.
 *      .fill                   The primary fill color of the slice.
 *      .negativeFill           The fill color for the negative "unsatisfied" portion of the 
 *                              slice.
 *      .labelTextColor         The color of the slice label text.
 */
function LifewheelStyles(values) {
  mergeWheelOptions(this, LifewheelStyles.defaultValues, values)
}
LifewheelStyles.defaultValues = {
  outlineWidth: 1,
  outlineColor: "rgba(255,255,255,0.75)",
  radialDividerWidth: 1.5,
  radialDividerColor: "white",
  rimDividerWidth: 2,
  rimDividerColor: "white",
  fontFamily: "Verdana,Arial",
  slices: [
    { fill: "#c88", negativeFill: "white", labelTextColor: "#381468" },
    { fill: "#8c8", negativeFill: "white", labelTextColor: "#381468" },
    { fill: "#88c", negativeFill: "white", labelTextColor: "#381468" },
    { fill: "#aa8", negativeFill: "white", labelTextColor: "#381468" },
    { fill: "#8aa", negativeFill: "white", labelTextColor: "#381468" },
    { fill: "#a8a", negativeFill: "white", labelTextColor: "#381468" },
    { fill: "#cb7", negativeFill: "white", labelTextColor: "#381468" },
    { fill: "#7cb", negativeFill: "white", labelTextColor: "#381468" }
  ]
}

/*
 */
function Lifewheel(stylesValues, geometryValues, modelValues) {
  this.styles = new LifewheelStyles(stylesValues)
  this.geometry = new LifewheelGeometry(geometryValues)
  this.model = new LifewheelModel(modelValues)
}
Lifewheel.prototype.render = function(context) {
  const cx = this.geometry.centerX;
  const cy = this.geometry.centerY;
  const radius = this.geometry.radius;
  const tabHeight = this.geometry.radius / 6;
  const labelFontSize = Math.floor(tabHeight / 6) * 4;
  const innerRadius = radius - tabHeight - this.styles.rimDividerWidth;
  const rotation = this.geometry.rotation;

  if (radius < 1) {
    return;
  }

  // Maintain a current point.
  var x = cx;
  var y = cy;

  function moveCurrentPoint(distance, angle) {
    x += distance * Math.cos(angle);
    y += distance * Math.sin(angle);
  }

  function sliceToAngle(index) {
    return SLICE_ANGLE * index - rotation;
  }

  // Color in pie slices.
  for (var s = 0; s < NSLICES; ++s) {
    context.fillStyle = this.styles.slices[s].fill;
    context.beginPath()
    x = cx; y = cy;
    context.moveTo(x, y);
    moveCurrentPoint(radius, sliceToAngle(s));
    context.lineTo(x, y);
    context.arc(cx, cy, radius, sliceToAngle(s), sliceToAngle(s + 1))
    context.closePath();
    context.fill()
  }

  // Lighten the unsatisfied portions.
  for (var s = 0; s < NSLICES; ++s) {
    var value = this.model.getValue(s)
    context.fillStyle = value == null ? "#ddd" : this.styles.slices[s].negativeFill;
    context.beginPath()
    x = cx; y = cy;
    context.moveTo(x, y);
    moveCurrentPoint(innerRadius, sliceToAngle(s));
    context.lineTo(x, y);
    context.arc(cx, cy, innerRadius, sliceToAngle(s), sliceToAngle(s + 1))
    context.closePath();
    context.fill()
  }

  // Redarken the satisfied portions.
  for (var s = 0; s < NSLICES; ++s) {
    var value = this.model.getValue(s)
    if (!value) continue;
    context.fillStyle = this.styles.slices[s].fill;
    context.beginPath()
    x = cx; y = cy;
    context.moveTo(x, y);
    moveCurrentPoint(innerRadius * value / 10, sliceToAngle(s));
    context.lineTo(x, y);
    context.arc(cx, cy, innerRadius * value / 10, sliceToAngle(s), sliceToAngle(s + 1))
    context.closePath();
    context.fill()
  }

  // Draw the spokes.
  context.beginPath()
  context.lineWidth = this.styles.radialDividerWidth;
  context.strokeStyle = this.styles.radialDividerColor;
  for (var s = 0; s < NSLICES; ++s) {
    x = cx; y = cy;
    context.moveTo(x, y);
    moveCurrentPoint(radius, sliceToAngle(s));
    context.lineTo(x, y);
  }
  context.stroke()

  // Draw the inner ring.
  context.lineWidth = this.styles.rimDividerWidth;
  context.strokeStyle = this.styles.rimDividerColor;
  context.beginPath()
  context.arc(cx, cy, innerRadius, sliceToAngle(0), sliceToAngle(NSLICES))
  context.stroke()

  // Draw the outer ring.
  context.beginPath()
  context.lineWidth = this.styles.outlineWidth;
  context.strokeStyle = this.styles.outlineColor;
  context.arc(cx, cy, radius, sliceToAngle(0), sliceToAngle(NSLICES))
  context.stroke()

  // Draw the labels.
  for (var s = 0; s < NSLICES; ++s) {
    var label = this.model.getLabel(s);
    if (!label) continue;
    context.save()
    context.fillStyle = this.styles.slices[s].labelTextColor;
    context.textAlign = "center";
    context.font = labelFontSize + "px " + this.styles.fontFamily;
    x = cx; y = cy;
    moveCurrentPoint(innerRadius + (labelFontSize / 3), sliceToAngle(s + 0.5));
    context.translate(x, y)
    context.rotate(sliceToAngle(s + 0.5) + Math.PI/2)
    context.fillText(this.model.getLabel(s), 0, 0)
    context.restore()
  }
}

module.exports = {
  NSLICES: NSLICES,
  Lifewheel: Lifewheel,
  LifewheelModel: LifewheelModel,
  LifewheelGeometry: LifewheelGeometry,
  LifewheelStyles: LifewheelStyles
}
