(function(canvas, rightOverlayDiv) {
  var defaultWheelParams = {
    fills: [
      "#8cc", "#aaf", "yellow", "#fc8", "#faa", "#c8c", "#8f8", "#cc8",
    ],
    labels: [],
    values: [],
    center: { x: 250, y: 250 },
    radius: 220,
    tabHeight: 30,
    divider: {
      width: 0,
      style: "white"
    },
    gap: {
      style: "white"
    },
    circumference: {
      width: 1,
      style: "white"
    },
    innerCircumference: {
      width: 1,
      style: "rgba(255,255,255,0.5)"
    },
    label: {
      font: "18px Arial"
    },
    baseAngle: 2*Math.PI/16
  }
  function drawIt(options) {
    const cx = options.center.x;
    const cy = options.center.y;
    const radius = options.radius;
    const innerRadius = radius - options.tabHeight;
    const baseAngle = options.baseAngle;

    var context = canvas.getContext("2d")

    var x = cx;
    var y = cy;

    function segToAngle(seg) {
      return baseAngle + 2*Math.PI * seg / 8;
    }

    function move(distance, angle) {
      x += distance * Math.cos(angle);
      y += distance * Math.sin(angle);
    }

    function getValue(seg) {
      try {
        var value = options.values[seg];
        if (typeof value !== "number") return null;
        return Math.floor(Math.max(0, Math.min(10, value)))
      }
      catch (e) {
        return null;
      }
    }

    function getLabel(seg) {
      try {
        return options.labels[seg];
      }
      catch (e) {
        return null;
      }
    }

    // Color in pie slices.
    for (var seg = 0; seg < 8; ++seg) {
      context.fillStyle = options.fills[seg];
      context.beginPath()
      x = cx; y = cy;
      context.moveTo(x, y);
      move(radius, segToAngle(seg));
      context.lineTo(x, y);
      context.arc(cx, cy, radius, segToAngle(seg), segToAngle(seg + 1))
      context.closePath();
      context.fill()
    }

    // Lighten the unsatisfied portions.
    for (var seg = 0; seg < 8; ++seg) {
      var value = getValue(seg)
      if (value == 10) continue;
      context.fillStyle = value == null ? "#ddd" : options.gap.style;
      context.beginPath()
      x = cx; y = cy;
      context.moveTo(x, y);
      move(innerRadius, segToAngle(seg));
      context.lineTo(x, y);
      context.arc(cx, cy, innerRadius, segToAngle(seg), segToAngle(seg + 1))
      context.closePath();
      context.fill()
    }

    // Redarken the satisfied portions.
    for (var seg = 0; seg < 8; ++seg) {
      var value = getValue(seg)
      if (value == 10 || value == null || value == 0) continue;
      context.fillStyle = options.fills[seg];
      context.beginPath()
      x = cx; y = cy;
      context.moveTo(x, y);
      move(innerRadius * value / 10, segToAngle(seg));
      context.lineTo(x, y);
      context.arc(cx, cy, innerRadius * value / 10, segToAngle(seg), segToAngle(seg + 1))
      context.closePath();
      context.fill()
    }

    // Draw the ribs.
    context.beginPath()
    context.lineWidth = options.divider.width;
    context.strokeStyle = options.divider.style;
    for (var seg = 0; seg < 8; ++seg) {
      x = cx; y = cy;
      context.moveTo(x, y);
      move(radius, segToAngle(seg));
      context.lineTo(x, y);
    }
    context.stroke()

    // Draw the inner ring.
    context.lineWidth = options.innerCircumference.width;
    context.strokeStyle = options.innerCircumference.style;
    context.beginPath()
    context.arc(cx, cy, innerRadius, segToAngle(0), segToAngle(8))
    context.stroke()

    // Draw the outer ring.
    context.beginPath()
    context.lineWidth = options.circumference.width;
    context.strokeStyle = options.circumference.style;
    context.arc(cx, cy, radius, segToAngle(0), segToAngle(8))
    context.stroke()

    // Draw the labels.
    for (var seg = 0; seg < 8; ++seg) {
      var label = getLabel(seg);
      if (!label) continue;
      context.save()
      context.fillStyle = "black";
      context.textAlign = "center";
      context.font = options.label.font;
      x = cx; y = cy;
      move(innerRadius + 4, segToAngle(seg + 0.5));
      context.translate(x, y)
      context.rotate(segToAngle(seg + 0.5) + Math.PI/2)
      context.fillText(options.labels[seg], 0, 0)
      context.restore()
    }
  }
  var localWheelParams = JSON.parse(localStorage.getItem("state")) || {
    values: [null,null,null,null,null,null,null,null],
    labels: [null,null,null,null,null,null,null,null],
    baseAngle: defaultWheelParams.baseAngle
  }
  // Animation variables.
  var interval = null;
  var currentAngle = localWheelParams.baseAngle; 
  function draw() {
    drawIt(Object.assign({}, defaultWheelParams, localWheelParams, { baseAngle: currentAngle }))
  }
  draw();
  canvas.onclick = function() {
    rot(3);
  }
  function changeValue(event) {
    var index = parseInt(event.target.getAttribute("data-index"))
    var newValue = parseInt(event.target.value)
    localWheelParams.values[index] = newValue;
    draw();
    save();
  }
  function changeLabel(event) {
    var index = parseInt(event.target.getAttribute("data-index"))
    var newValue = event.target.value;
    localWheelParams.labels[index] = newValue;
    draw();
    save();
  }
  function rot(dir) {
    localWheelParams.baseAngle += (2*Math.PI/8) * dir;
    save();
    if (!interval) {
      interval = setInterval(function() {
        var diff = localWheelParams.baseAngle - currentAngle;
        if (Math.abs(diff) < 0.005) {
          clearInterval(interval);
          interval = null;
          currentAngle = localWheelParams.baseAngle;
        }
        else {
          currentAngle += diff * 0.15;
        }
        draw();
      }, 40);
    }
  }
  function save() {
    localStorage.setItem("state", JSON.stringify(localWheelParams))
    console.log('saved')
  }
})(document.querySelector("#theCanvas"), document.querySelector("#rightOverlayDiv"));
