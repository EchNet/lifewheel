/**
 * Maintain state of a wheel and render it on a canvas.
 *
 * Exports:
 *
 * constants:
 *   PLACEMENT_NEUTRAL = 0;          for placement of wheel in canvas
 *   PLACEMENT_OFFSTAGE = 1;
 *   PLACEMENT_CENTER_STAGE = 2;
 *   PLACEMENT_STAGE_LEFT = 3;
 *
 * Wheel state.
 *  .visible          Are we drawing or no?
 *  .fills            Array of NSECTIONS fill styles
 *  .labels           Array of NSECTIONS rim label strings
 *  .values           Array of NSECTIONS satisfaction values 0..10
 *  .placement        The at-rest size and position of the wheel, one of the PLACEMENT constants.
 *  .currentSection   The index 0..7 of the current section
 *  .open             True if the current section is maximized
 *
 */
LifeWheel.define(function(options) {

  const defaultOptions = {
    fills: [
      "#8cc", "#abf", "#ff8", "#fc8", "#faa", "#c8c", "#8f8", "#dc9"
    ]
  }

  options = Object.assign({}, defaultOptions, options);

  /**
   * Wheel placements.
   */
  const PLACEMENT_NEUTRAL = 0;
  const PLACEMENT_OFFSTAGE = 1;
  const PLACEMENT_CENTER_STAGE = 2;
  const PLACEMENT_STAGE_LEFT = 3;

  /**
   * Animation/transition constants.
   */
  const DECAY_PER_MILLI = 0.99985;

  /**
   * Animation stepper.
   */
  function approachGoalValue(currentValue, goalValue, elapsedTime) {
    const diff = goalValue - currentValue;
    if (Math.abs(diff) < 0.01) {
      return goalValue;
    }
    const newDiff = diff * Math.pow(DECAY_PER_MILLI, elapsedTime)
    return goalValue - newDiff;
  }

  /**
   * Animation stepper.
   */
  function approachGoal(currentParams, targetParams, elapsedTime) {
    var waysToGo = false;
    for (var key in currentParams) {
      const currentValue = currentParams[key];
      const targetValue = targetParams[key];
      if (currentValue !== targetValue) {
        const newValue = (typeof currentValue === "string")
          ? targetValue
          : approachGoalValue(currentValue, targetValue, elapsedTime);
        currentParams[key] = newValue;
        if (newValue !== targetValue) {
          waysToGo = true;
        }
      }
    }
    return waysToGo;
  }

  /**
   * Class WheelCanvas maintains visual state of one wheel on the canvas provided.
   */
  function WheelCanvas(canvas) {

    var visible = false;
    var fills = options.fills;
    var labels = [];
    var values = [];
    var placement = PLACEMENT_NEUTRAL;
    var currentSection = 0;
    var open = false;

    this.getState = function() {
      return {
        fills: fills.slice(),
        labels: labels.slice(),
        values: values.slice(),
        placement: placement,
        currentSection: currentSection,
        open: open 
      }
    }

    this.setState = function(state) {
      fills = (state.fills && state.fills.slice()) || fills;
      labels = (state.labels && state.labels.slice()) || labels;
      values = (state.values && state.values.slice()) || values;
      placement = state.placement || PLACEMENT_NEUTRAL;
      currentSection = state.currentSection || 0;
      open = state.open;
    }

    function placementToRadius() {
      switch (placement) {
      case PLACEMENT_NEUTRAL:
        return canvas.height * 0.45;
      case PLACEMENT_OFFSTAGE:
        return 20;
      case PLACEMENT_CENTER_STAGE:
        return canvas.height;
      case PLACEMENT_STAGE_LEFT:
        return canvas.height * 0.45;
      }
    }

    function placementToCenter() {
      switch (placement) {
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

    function getWheelRenderParams() {
      return {
        fills: fills,
        values: values,
        labels: labels,
        center: placementToCenter(),
        radius: placementToRadius(),
        baseAngle: LifeWheel.getAngleForTopSection(currentSection)
      }
    }

    function flattenWheelRenderParams(params) {

      function flatten(key) {
        var result = {}
        for (var i in params[key]) {
          result[key + i] = params[key][i];
        }
        return result;
      }

      return Object.assign(
        flatten("fills"),
        flatten("values"),
        flatten("labels"),
        flatten("center"),
        { radius: params.radius, baseAngle: params.baseAngle }
      )
    }

    function unflattenWheelRenderParams(params) {

      function unflatten(key) {
        var result = {};
        result[key] = [];
        for (var i = 0; params[key + i] !== undefined; ++i) {
          result[key].push(params[key + i]);
        }
        return result;
      }

      return Object.assign(
        unflatten("fills"),
        unflatten("values"),
        unflatten("labels"),
        {
          center: { x: params.centerx, y: params.centery },
          radius: params.radius,
          baseAngle: params.baseAngle
        }
      )
    }

    // Transition control variables.
    var currentWheelRenderParams;
    var targetWheelRenderParams;
    var transitionTimer;
    var lastTimestamp = null;

    this.setVisible = function(pVisible) {
      if (!!pVisible != visible) {
        visible = !!pVisible;
        startTransition();
      }
    }

    this.setLabel = function(index, label) {
      if (labels[index] != label) {
        labels[index] = label;
        startTransition();
      }
    }

    this.setValue = function(index, value) {
      if (values[index] != value) {
        values[index] = value;
        startTransition();
      }
    }

    this.setPlacement = function(pPlacement) {
      if (placement != pPlacement) {
        placement = pPlacement;
        startTransition();
      }
    }

    this.setCurrentSection = function(pCurrentSection) {
      if (currentSection != pCurrentSection) {
        currentSection = pCurrentSection;
        startTransition();
      }
    }

    this.open = function(pOpen) {
      if (open != !!pOpen) {
        open = !!pOpen;
        startTransition();
      }
    }

    function startTransition() {
      // Update target values.
      targetWheelRenderParams = flattenWheelRenderParams(getWheelRenderParams())
      if (!transitionTimer) {
        continueTransition();  // Kick off the animation if it's not already running.
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
        const context = canvas.getContext("2d")
        context.clearRect(0, 0, canvas.width, canvas.height)

        let keepStepping = false;
        if (visible) {
          if (!currentWheelRenderParams) {
            currentWheelRenderParams = flattenWheelRenderParams(getWheelRenderParams())
          }
          keepStepping = approachGoal(
              currentWheelRenderParams, targetWheelRenderParams, timestamp - lastTimestamp)
          LifeWheel.renderWheel(unflattenWheelRenderParams(currentWheelRenderParams), context);
        }
        else {
          currentWheelRenderParams = null;
        }

        if (keepStepping) {
          continueTransition();
        }
        else {
          transitionTimer = null;
          lastTimestamp = null;
        }
      }
    }
  }

  WheelCanvas.PLACEMENT_NEUTRAL = PLACEMENT_NEUTRAL;
  WheelCanvas.PLACEMENT_OFFSTAGE = PLACEMENT_OFFSTAGE;
  WheelCanvas.PLACEMENT_CENTER_STAGE = PLACEMENT_CENTER_STAGE;
  WheelCanvas.PLACEMENT_STAGE_LEFT = PLACEMENT_STAGE_LEFT;

  return {
    WheelCanvas: WheelCanvas
  }
});
