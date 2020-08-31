/**
 * Manage the views and transitions.
 * Exports: functions installController, start
 */
LifeWheel.define(function(options) {
  const defaultOptions = { stageSelector: ".lifewheel-stage" }
  options = Object.assign({}, defaultOptions, options);

  const controllers = {};
  var controllerCount = 0;

  function Stage(stageElement) {
    var self = this;
    var wheelCanvas;
    var state;
    var transitionsEnabled = false;
    var overlayContent = [];

    this.start = function() {
      wheelCanvas = (function() {
        // Create the canvas element and the WheelCanvas object.
        var canvas = document.createElement("canvas")
        canvas.width = 1260;
        canvas.height = 630;
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        stageElement.appendChild(canvas);
        return new LifeWheel.WheelCanvas(canvas);
      })();

      // Check LocalStorage for prior state.
      restoreState();

      // Start or resume.
      openPhase(window.location.hash.substring(1) || discernPhase());
      transitionsEnabled = true;
    }

    function discernPhase() {
      var highestName = "default";
      var highestPriority;
      for (var controllerName in controllers) {
        var controllerClass = controllers[controllerName];
        if (controllerClass.acceptsState && controllerClass.acceptsState(state) &&
            (highestPriority === undefined || controllerClass.PRIORITY > highestPriority)) {
          highestName = controllerName;
          higestPriority = controllerClass.PRIORITY;
        }
      }
      return highestName;
    }

    function openPhase(phaseName) {
      new (controllers[phaseName])(self).connect(transitionsEnabled);
    }

    /**
     * Called by a PhaseController to bring in content on top of the wheel canvas.
     */
    this.introduceOverlayContent = function(container) {
      container.style.opacity = transitionsEnabled ? 0.0 : 1.0;
      stageElement.appendChild(container);
      if (transitionsEnabled) {
        window.setTimeout(function() { container.style.opacity = 1 }, 10)
      }
      overlayContent.push(container);
    }

    /**
     * Called by a PhaseController to advance to the next phase.
     */
    this.advance = function(phaseName) {
      for (var i in overlayContent) {
        var container = overlayContent[i];
        container.style.opacity = 0.0;
        container.addEventListener("click", function(e) { e.stopPropagation() }, true);
        window.setTimeout(function() { container.remove() }, 2500)
      }
      overlayContent = [];
      openPhase(phaseName);
    }

    this.assignState = function(hash) {
      Object.assign(state, hash)
      saveState()
    }

    function saveState() {
      localStorage.setItem("state", JSON.stringify(state))
    }

    function restoreState() {
      state = JSON.parse(localStorage.getItem("state")) || {}
    }

    this.getWheelCanvas = function() {
      return wheelCanvas;
    }

    this.getState = function() {
      return state;
    }
  }

  function installController(controllerName, controllerClass) {
    controllerClass.PRIORITY = controllerCount;
    controllers[controllerName] = controllerClass;
    ++controllerCount;
  }

  function start() {
    const stageElement = document.querySelector(options.stageSelector);
    if (!stageElement.style.position) {
      stageElement.style.position = "relative";
    }
    new Stage(stageElement).start()
  }

  return {
    installController: installController,
    start: start
  }
});
