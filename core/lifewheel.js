/**
 * Render a lifewheel.
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
Lifewheel.prototype.render = function(surface) {
  const cx = this.geometry.centerX;
  const cy = this.geometry.centerY;
  const radius = this.geometry.radius;
  const tabHeight = this.geometry.radius / 6;
  const labelFontSize = Math.floor(tabHeight / 6) * 4;
  const innerRadius = radius - tabHeight - this.styles.rimDividerWidth;
  const rotation = this.geometry.rotation;

  function sliceToAngle(index) {
    return SLICE_ANGLE * index - rotation;
  }

  // Color in pie slices.
  for (var s = 0; s < NSLICES; ++s) {
    surface.openFilledShape(this.styles.slices[s].fill)
    surface.moveTo(cx, cy)
    surface.lineBy(radius, sliceToAngle(s))
    surface.arc(cx, cy, radius, sliceToAngle(s), sliceToAngle(s + 1))
    surface.closeFilledShape()
  }

  // Lighten the unsatisfied portions.
  for (var s = 0; s < NSLICES; ++s) {
    var value = this.model.getValue(s)
    surface.openFilledShape(value == null ? "#ddd" : this.styles.slices[s].negativeFill)
    surface.moveTo(cx, cy)
    surface.lineBy(innerRadius, sliceToAngle(s))
    surface.arc(cx, cy, innerRadius, sliceToAngle(s), sliceToAngle(s + 1))
    surface.closeFilledShape()
  }

  // Redarken the satisfied portions.
  for (var s = 0; s < NSLICES; ++s) {
    var value = this.model.getValue(s)
    if (!value) continue;
    surface.openFilledShape(this.styles.slices[s].fill);
    surface.moveTo(cx, cy);
    surface.lineBy(innerRadius * value / 10, sliceToAngle(s));
    surface.arc(cx, cy, innerRadius * value / 10, sliceToAngle(s), sliceToAngle(s + 1))
    surface.closeFilledShape()
  }

  // Draw the spokes.
  surface.openStroke(this.styles.radialDividerWidth, this.styles.radialDividerColor)
  for (var s = 0; s < NSLICES; ++s) {
    surface.moveTo(cx, cy)
    surface.lineBy(radius, sliceToAngle(s))
  }
  surface.closeStroke()

  // Draw the rim divider.
  surface.openStroke(this.styles.rimDividerWidth, this.styles.rimDividerColor)
  surface.arc(cx, cy, innerRadius, sliceToAngle(0), sliceToAngle(NSLICES))
  surface.closeStroke()

  // Draw the outline.
  surface.openStroke(this.styles.outlineWidth, this.styles.outlineColor)
  surface.arc(cx, cy, radius, sliceToAngle(0), sliceToAngle(NSLICES))
  surface.closeStroke()

  // Draw the labels.
  for (var s = 0; s < NSLICES; ++s) {
    var label = this.model.getLabel(s);
    if (label) {
      surface.drawArcedText(
          label,
          this.styles.slices[s].labelTextColor,
          labelFontSize,
          this.styles.fontFamily,
          cx, cy,
          innerRadius + (labelFontSize / 3),
          sliceToAngle(s + 0.5))
    }
  }
}

module.exports = Object.assign(Lifewheel, {
  NSLICES: NSLICES,
  SLICE_ANGLE: SLICE_ANGLE,
  Model: LifewheelModel,
  Geometry: LifewheelGeometry,
  Styles: LifewheelStyles
})
