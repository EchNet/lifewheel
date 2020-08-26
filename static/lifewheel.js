(function(canvas, rightOverlayDiv) {
  const NSECTIONS = 8;

  const STYLES = {
    divider: {        // Line styles for the radial section dividing line.
      width: 1,
      stroke: "white"
    },
    gap: {            // Fill styles for the "dissatisfaction gap".
      fill: "white"
    },
    rim: {            // Line styles for the outer rim.
      width: 1,
      style: "rgba(255,255,255,0.5)"
    },
    innerRim: {       // Line styles for the inner rim.
      width: 1,
      stroke: "white"
    },
    label: {          // Text styles for the labels.
      fontFamily: "Arial"
    }
  }

  /**
   * The wheel renderer.
   * Params:
   *  .fills            Array of NSECTIONS fill styles
   *  .labels           Array of NSECTIONS rim label strings
   *  .values           Array of NSECTIONS satisfaction values 0..10
   *  .center           The center point on the canvas
   *  .radius           Distance from center point to outer edge
   *  .tabHeight        Distance along radius from inner edge to outer
   *  .baseAngle        Angle of rotation from base heading
   */
  function renderWheel(params) {
    const cx = params.center.x;
    const cy = params.center.y;
    const radius = params.radius;
    const innerRadius = radius - params.tabHeight - STYLES.innerRim.width;
    const baseAngle = params.baseAngle;

    var context = canvas.getContext("2d")
    context.clearRect(0, 0, canvas.width, canvas.height)

    var x = cx;
    var y = cy;

    function segToAngle(seg) {
      return baseAngle + 2*Math.PI * seg / NSECTIONS;
    }

    function moveCurrentPoint(distance, angle) {
      x += distance * Math.cos(angle);
      y += distance * Math.sin(angle);
    }

    function getValue(seg) {
      try {
        var value = params.values[seg];
        if (typeof value !== "number") return null;
        return Math.floor(Math.max(0, Math.min(10, value)))
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
      if (value == null || value == 0) continue;
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
      context.fillStyle = "black";
      context.textAlign = "center";
      context.font = params.labelFontSize + "px " + STYLES.label.fontFamily;
      x = cx; y = cy;
      moveCurrentPoint(innerRadius + (params.labelFontSize / 3), segToAngle(seg + 0.5));
      context.translate(x, y)
      context.rotate(segToAngle(seg + 0.5) + Math.PI/2)
      context.fillText(params.labels[seg], 0, 0)
      context.restore()
    }
  }

  /**
   * Wheel placements.
   */
  const PLACEMENT_NEUTRAL = 0;
  const PLACEMENT_OFFSTAGE = 1;
  const PLACEMENT_CENTER_STAGE = 2;
  const PLACEMENT_STAGE_LEFT = 3;

  function placementToCenter(position) {
    switch (position) {
    case PLACEMENT_NEUTRAL:
      return { x: canvas.width / 2, y: canvas.height / 2 }
    case PLACEMENT_OFFSTAGE:
      return { x: canvas.height / -3, y: canvas.height }
    case PLACEMENT_CENTER_STAGE:
      return { x: canvas.width / 2, y: canvas.height }
    case PLACEMENT_STAGE_LEFT:
      return { x: canvas.width / 4, y: canvas.height / 2 }
    }
  }

  function placementToRadius(position) {
    switch (position) {
    case PLACEMENT_NEUTRAL:
      return canvas.height * 0.45;
    case PLACEMENT_OFFSTAGE:
      return 0;
    case PLACEMENT_CENTER_STAGE:
      return canvas.height;
    case PLACEMENT_STAGE_LEFT:
      return canvas.height * 0.45;
    }
  }

  /**
   * Wheel state.
   *  .fills            Array of NSECTIONS fill styles
   *  .labels           Array of NSECTIONS rim label strings
   *  .values           Array of NSECTIONS satisfaction values 0..10
   *  .position         The at-rest position of the wheel, one of the PLACEMENT constants.
   *  .currentSection   The index 0..7 of the current section
   *  .open             True if the current section is maximized
   */
  const HALF_SLICE = 2*Math.PI/16;

  /**
   * Given an app state and a canvas, produce the parameters for rendering the wheel in that
   * state on that canvas.
   */
  function appStateToRenderParams(state) {
    const center = state.cx ? { x: state.cx, y: state.cy } : placementToCenter(0);
    const radius = placementToRadius(0);
    const tabHeight = radius / 6;
    const labelFontSize = Math.floor(tabHeight / 8) * 6;
    const baseAngle = (1 - 2*state.currentSection) * HALF_SLICE;

    return {
      fills: state.wheel.fills,
      values: state.wheel.values,
      labels: state.wheel.labels,
      center: center,
      radius: radius,
      tabHeight: tabHeight,
      labelFontSize: labelFontSize,
      baseAngle: baseAngle
    }
  }

  /**
   * App state.
   */

  /**
   * Wheel state is saved between sessions.
   */
  function initialWheelState() {
    var state = JSON.parse(localStorage.getItem("state")) || {}
    if (!state.fills) {
      state.fills = [
        "#8cc", "#abf", "#ff8", "#fc8", "#faa", "#c8c", "#8f8", "#dc9"
      ]
    }
    if (!state.values) {
      state.values = [null,null,null,null,null,null,null,null]
    }
    if (!state.labels) {
      state.labels = [null,null,null,null,null,null,null,null]
    }
    return state;
  }

  function initialAppState() {
    return {
      wheel: initialWheelState(),
      phase: "default",
      placement: PLACEMENT_NEUTRAL,
      currentSection: 0,
      open: false
    }
  }

  function draw() {
    renderWheel(appStateToRenderParams(appState))
  }

  var appState = initialAppState();
  console.log(appState)
  draw();

  // TEST
  canvas.onclick = function(event) {
    var rect = canvas.getBoundingClientRect();
    mutate("cx", (event.clientX - rect.left) * canvas.width / rect.width, true)
    mutate("cy", (event.clientY - rect.top) * canvas.height / rect.height, true)
    mutate("currentSection", (appState.currentSection + 2) % NSECTIONS, true)
  }

  function getAppStateValue(key) {
    return appState[key];
  }

  function setAppStateValue(key, value) {
    appState[key] = value;
  }

  function mutate(key, value, withTransition) {
    var currentValue = getAppStateValue(key);
    if (currentValue != value) {
      if (withTransition) {
        transitionParams = transitionParams || appStateToRenderParams(appState)
        setAppStateValue(key, value);
        startTransition()
      }
      else {
        setAppStateValue(key, value);
        draw();
      }
    }
  }

  /**
   * Animation/transition constants.
   */
  const DECAY_PER_MILLI = 0.99985;

  function approachGoal(currentValue, goalValue, elapsedTime) {
    const diff = goalValue - currentValue;
    if (Math.abs(diff) < 0.01) {
      return goalValue;
    }
    const newDiff = diff * Math.pow(DECAY_PER_MILLI, elapsedTime)
    return goalValue - newDiff;
  }

  // Animation variables.
  var transitionTimer;
  var transitionParams;
  var lastTimestamp = null;

  function startTransition() {
    if (!transitionTimer) {
      continueTransition();
    }
  }

  function continueTransition() {
    transitionTimer = window.requestAnimationFrame(stepTransition)
  }

  function stepTransition(timestamp) {
    if (lastTimestamp == null) {
      lastTimestamp = timestamp;
      continueTransition();
    }
    else {
      console.log("transitionParams before", transitionParams);
      var goalParams = appStateToRenderParams(appState);
      console.log("goalParams before", goalParams);
      let waysToGo = false;
      transitionParams.center.x = approachGoal(transitionParams.center.x, goalParams.center.x, timestamp - lastTimestamp)
      if (transitionParams.center.x != goalParams.center.x) {
        waysToGo = true;
      }
      transitionParams.center.y = approachGoal(transitionParams.center.y, goalParams.center.y, timestamp - lastTimestamp)
      if (transitionParams.center.y != goalParams.center.y) {
        waysToGo = true;
      }
      transitionParams.baseAngle = approachGoal(transitionParams.baseAngle, goalParams.baseAngle, timestamp - lastTimestamp)
      if (transitionParams.baseAngle != goalParams.baseAngle) {
        waysToGo = true;
      }
      console.log("transitionParams after", transitionParams);
      renderWheel(transitionParams);
      if (waysToGo) {
        continueTransition();
      }
      else {
        transitionTimer = null;
        transitionParams = null;
        lastTimestamp = null;
      }
    }
  }

  function saveWheelState() {
    localStorage.setItem("state", JSON.stringify(localWheelRenderParams))
    console.log('saved')
  }

  // TODO
  function changeValue(event) {
    var index = parseInt(event.target.getAttribute("data-index"))
    var newValue = parseInt(event.target.value)
    localWheelRenderParams.values[index] = newValue;
    draw();
    saveWheelState();
  }

  // TODO
  function changeLabel(event) {
    var index = parseInt(event.target.getAttribute("data-index"))
    var newValue = event.target.value;
    localWheelRenderParams.labels[index] = newValue;
    draw();
    saveWheelState();
  }

})(document.querySelector("#theCanvas"), document.querySelector("#rightOverlayDiv"));
