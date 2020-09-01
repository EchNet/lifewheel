/**
 * Exports:
 *
 * function renderWheel: render a wheel onto a canvas.
 *
 *   params:
 *     .fills       Array of NSECTIONS fill styles
 *     .labels      Array of NSECTIONS rim label strings
 *     .values      Array of NSECTIONS satisfaction values 0..10
 *     .center      {x,y} center point on the canvas
 *     .radius      Distance from center point to outer edge
 *     .baseAngle   Angle of rotation from base heading
 *  
 *   context: HtmlCanvasContext2D
 */
LifeWheel.define(function(options) {

  const NSECTIONS = 8;

  const HALF_SLICE = Math.PI / NSECTIONS;
  const FULL_SLICE = 2 * HALF_SLICE;

  const STYLES = {
    divider: {        // Line styles for the radial section dividing line.
      width: 2,
      stroke: "white"
    },
    gap: {            // Fill styles for the "dissatisfaction gap".
      fill: "white"
    },
    rim: {            // Line styles for the outer rim.
      width: 1,
      style: "rgba(255,255,255,0.75)"
    },
    innerRim: {       // Line styles for the inner rim.
      width: 2,
      stroke: "white"
    },
    label: {          // Text styles for the labels.
      fontFamily: "Verdana,Arial",
      fill: "#381468"
    }
  }

  function renderWheel(params, context) {
    const cx = params.center.x;
    const cy = params.center.y;
    const radius = params.radius;
    const tabHeight = radius / 6;
    const labelFontSize = Math.floor(tabHeight / 6) * 4;
    const innerRadius = radius - tabHeight - STYLES.innerRim.width;
    const baseAngle = params.baseAngle;

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

    function getValue(seg) {
      try {
        var value = params.values[seg];
        if (typeof value !== "number") return null;
        return Math.max(0, Math.min(10, value))
      }
      catch (e) {
        return null;
      }
    }

    function getLabel(seg) {
      try {
        return params.labels[seg];
      }
      catch (e) {
        return null;
      }
    }

    function segToAngle(seg) {
      return baseAngle + FULL_SLICE * seg;
    }

    // Color in pie slices.
    for (var seg = 0; seg < NSECTIONS; ++seg) {
      context.fillStyle = params.fills[seg];
      context.beginPath()
      x = cx; y = cy;
      context.moveTo(x, y);
      moveCurrentPoint(radius, segToAngle(seg));
      context.lineTo(x, y);
      context.arc(cx, cy, radius, segToAngle(seg), segToAngle(seg + 1))
      context.closePath();
      context.fill()
    }

    // Lighten the unsatisfied portions.
    for (var seg = 0; seg < NSECTIONS; ++seg) {
      var value = getValue(seg)
      context.fillStyle = value == null ? "#ddd" : STYLES.gap.fill;
      context.beginPath()
      x = cx; y = cy;
      context.moveTo(x, y);
      moveCurrentPoint(innerRadius, segToAngle(seg));
      context.lineTo(x, y);
      context.arc(cx, cy, innerRadius, segToAngle(seg), segToAngle(seg + 1))
      context.closePath();
      context.fill()
    }

    // Redarken the satisfied portions.
    for (var seg = 0; seg < NSECTIONS; ++seg) {
      var value = getValue(seg)
      if (!value) continue;
      context.fillStyle = params.fills[seg];
      context.beginPath()
      x = cx; y = cy;
      context.moveTo(x, y);
      moveCurrentPoint(innerRadius * value / 10, segToAngle(seg));
      context.lineTo(x, y);
      context.arc(cx, cy, innerRadius * value / 10, segToAngle(seg), segToAngle(seg + 1))
      context.closePath();
      context.fill()
    }

    // Draw the spokes.
    context.beginPath()
    context.lineWidth = STYLES.divider.width;
    context.strokeStyle = STYLES.divider.stroke;
    for (var seg = 0; seg < NSECTIONS; ++seg) {
      x = cx; y = cy;
      context.moveTo(x, y);
      moveCurrentPoint(radius, segToAngle(seg));
      context.lineTo(x, y);
    }
    context.stroke()

    // Draw the inner ring.
    context.lineWidth = STYLES.innerRim.width;
    context.strokeStyle = STYLES.innerRim.style;
    context.beginPath()
    context.arc(cx, cy, innerRadius, segToAngle(0), segToAngle(NSECTIONS))
    context.stroke()

    // Draw the outer ring.
    context.beginPath()
    context.lineWidth = STYLES.rim.width;
    context.strokeStyle = STYLES.rim.stroke;
    context.arc(cx, cy, radius, segToAngle(0), segToAngle(NSECTIONS))
    context.stroke()

    // Draw the labels.
    for (var seg = 0; seg < NSECTIONS; ++seg) {
      var label = getLabel(seg);
      if (!label) continue;
      context.save()
      context.fillStyle = STYLES.label.fill;
      context.textAlign = "center";
      context.font = labelFontSize + "px " + STYLES.label.fontFamily;
      x = cx; y = cy;
      moveCurrentPoint(innerRadius + (labelFontSize / 3), segToAngle(seg + 0.5));
      context.translate(x, y)
      context.rotate(segToAngle(seg + 0.5) + Math.PI/2)
      context.fillText(params.labels[seg], 0, 0)
      context.restore()
    }
  }

  /**
   *
   */
  function getAngleForTopSection(section) {
    return ((27 - 2*section) * HALF_SLICE) % (Math.PI * 2);
  }

  return {
    NSECTIONS: NSECTIONS,
    renderWheel: renderWheel,
    getAngleForTopSection: getAngleForTopSection
  }
});
