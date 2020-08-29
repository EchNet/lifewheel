/**
 * Exports: start
 */
LifeWheel.define(function(options) {
  const defaultOptions = { fontFamily: "Verdana,Arial", stageSelector: ".lifewheel-stage" }
  options = Object.assign({}, defaultOptions, options);

  /**
   * DOM/styling helper.
   */
  function createAndStyleElement(tag, styleClass) {
    var element = document.createElement(tag)
    var styler = function(style, value) {
      element.style[style] = value;
      return styler;
    }
    styleClass = styleClass || tag;
    switch (styleClass) {
    case "button":
      styler(
        "padding", "4px 8px")(
        "fontFamily", options.fontFamily)(
        "fontSize", "20px")
      break;
    case "closeButton":
      styler(
        "padding", "0px 4px")(
        "background", "white")(
        "color", "black")(
        "border", "none")(
        "fontSize", "14px")(
        "fontFamily", options.fontFamily)(
        "fontWeight", 400)
      break;
    case "closeButtonContainer":
      styler(
        "position", "absolute")(
        "top", "6px")(
        "right", "6px")(
        "padding", "2px")(
        "border", "solid 1px white");
      element.onmouseenter = function() { element.style.borderColor = "#c5c5c5"; }
      element.onmouseleave = function() { element.style.borderColor = "white"; }
      break;
    case "textInput":
      styler(
        "width", "100%")(
        "fontFamily", options.fontFamily)(
        "fontSize", "18px")(
        "fontWeight", 300)(
        "border", "solid 1px #c5c5c5")(
        "borderRadius", "8px")(
        "padding", "8px")(
        "boxSizing", "border-box")
      break;
    case "normalMessage":
      styler(
        "textAlign", "center")(
        "fontSize", "16px")(
        "color", "black")(
        "fontFamily", options.fontFamily)(
        "fontWeight", "normal")(
        "marginTop", "8px")(
        "marginBottom", "8px")
      break;
    case "bigMessage":
      styler(
        "textAlign", "center")(
        "fontSize", "32px")(
        "color", "#882299")(
        "fontFamily", options.fontFamily)(
        "fontWeight", "bold")(
        "marginTop", "16px")(
        "marginBottom", "16px")
      break;
    case "bigBigMessage":
      styler(
        "textAlign", "center")(
        "fontSize", "64px")(
        "color", "#882299")(
        "fontFamily", options.fontFamily)(
        "fontWeight", "bold")(
        "marginTop", "24px")(
        "marginBottom", "24px")
      break;
    case "pseudoLink":
      styler(
        "cursor", "pointer")(
        "textAlign", "center")(
        "fontSize", "16px")(
        "textDecoration", "underline")(
        "color", "#777")(
        "fontFamily", options.fontFamily)(
        "fontWeight", "normal")(
        "marginTop", "12px")(
        "marginBottom", "24px")
      break;
    case "titleBar":
      styler(
        "textAlign", "center")(
        "fontSize", "48px")(
        "letterSpacing", "2px")(
        "fontWeight", 400)(
        "color", "#228")(
        "marginTop", "6px")(
        "marginBottom", "24px")
      break;
    case "inputContainer":
      styler("marginBottom", "24px")
      break;
    case "buttonContainer":
      styler("display", "flex")("justifyContent", "space-around")("marginTop", "30px")
      break;
    case "overlay":
      styler(
        "position", "absolute")(
        "top", "0px")(
        "left", "0px")(
        "bottom", "0px")(
        "right", "0px")(
        "padding", 0)(
        "display", "flex")(
        "background", "#f2e2c0")(
        "flexDirection", "column")(
        "justifyContent", "center")(
        "alignItems", "center")(
        "transition", "opacity 1.3s ease-in-out")
      break;
    case "arcOverlay":
      styler(
        "opacity", 0)(
        "position", "absolute")(
        "shapeOutside", "circle()")(
        "top", "100px")(
        "left", "120px")(
        "right", "120px")(
        "padding", 0)(
        "transition", "opacity 1.3s ease-in-out")
      break;
    }
    return element;
  }

  function createAndStyleButton(styleClass, label, clickHandler) {
    var button = createAndStyleElement("button", styleClass)
    button.type = "button";
    button.appendChild(document.createTextNode(label));
    button.onclick = clickHandler;
    return button;
  }

  function createAndStyleContainer(styleClass, children) {
    var container = createAndStyleElement("div", styleClass);
    for (var i = 0; i < children.length; ++i) {
      container.appendChild(children[i]);
    }
    return container;
  }

  function createMessageContainer(styleClass, message) {
    return createAndStyleContainer(styleClass, [
      document.createTextNode(message)
    ])
  }

  function DefaultController() {
    var stage;
    var container;

    this.connect = function(pStage) {
      stage = pStage;
      addUI();
    }

    function disconnect() {
      stage.removeOverlayContent(container);
    }

    function addUI() {
      container = createAndStyleContainer("overlay", [
        createAndStyleContainer("div", [
          createMessageContainer("bigBigMessage", "Feeling stuck?"),
          createMessageContainer("pseudoLink", "Click here.")
        ])
      ]);
      stage.introduceOverlayContent(container);
      container.onclick = function() {
        disconnect();
        stage.advance("getStarted")
      }
    }
  }

  function GetStartedController() {
    var stage;
    var container;

    this.connect = function(pStage, withTransition) {
      stage = pStage;
      intro(withTransition);
    }

    function intro(animate) {
      var step = 0;
      var interval;

      if (animate) {
        stage.getWheelCanvas().setTransitionSpeed("slow");
        stage.getWheelCanvas().setPlacement(LifeWheel.WheelCanvas.PLACEMENT_OFFSTAGE);
        stage.getWheelCanvas().setVisible(true);
        for (var i = 0; i < LifeWheel.NSECTIONS; ++i) {
          stage.getWheelCanvas().setValue(i, 0);
        }
        interval = window.setInterval(doIntroStep, 350);
      }
      else {
        for (var i = 0; i <= 10; ++i) {
          doIntroStep();
        }
        stage.getWheelCanvas().setVisible(true);
      }

      function doIntroStep() {
        switch (step) {
        case 0:
          stage.getWheelCanvas().setPlacement(LifeWheel.WheelCanvas.PLACEMENT_NEUTRAL);
          break;
        case 1:
          stage.getWheelCanvas().setCurrentSection(6);
          break;
        case 8:
          labelWheel();
          break;
        case 10:
          stage.getWheelCanvas().setPlacement(LifeWheel.WheelCanvas.PLACEMENT_CENTER_STAGE);
          window.clearInterval(interval);
          addUI()
        }
        if (step >= 2) {
          stage.getWheelCanvas().setValue(step - 2, 10);
        }
        ++step;
      }
    }

    function labelWheel() {
      const WHAMPLES = [ "", "", "", "", "", "Wheel", "of", "Life" ]
      for (var i = 0; i < WHAMPLES.length; ++i) {
        stage.getWheelCanvas().setLabel(i, WHAMPLES[i])
      }
    }

    function addUI() {
      container = createAndStyleContainer("arcOverlay", [
        createMessageContainer("normalMessage", "Lorem ipsum dolor sit amet,"),
        createMessageContainer("normalMessage", "consectetur adipiscing elit. Nunc aliquet"),
        createMessageContainer("normalMessage", "quam vel tellus dignissim, eget tempus libero"),
        createMessageContainer("normalMessage", "porta. Nullam nec varius libero. Nunc pulvinar a"),
        createMessageContainer("normalMessage", "lectus iaculis congue. Sed bibendum felis at consectetur."),
        createAndStyleContainer("buttonContainer", [
          createAndStyleButton("button", " Get Started! ", advance)
        ])
      ]);
      stage.introduceOverlayContent(container);
    }

    function advance() {
      stage.getWheelCanvas().setTransitionSpeed("fast");
      stage.getWheelCanvas().setPlacement(LifeWheel.WheelCanvas.PLACEMENT_OFFSTAGE);
      stage.getWheelCanvas().setLabel(5, "");
      stage.getWheelCanvas().setLabel(6, "");
      stage.getWheelCanvas().setLabel(7, "");
      stage.removeOverlayContent(container);
      stage.advance("chooseAreas");
    }
  }

  function ChooseAreasController() {
    var stage;
    var container;

    this.connect = function(pStage) {
      stage = pStage;
      container = createAndStyleContainer("overlay", [
        createMessageContainer("bigMessage", "Let's start by identifying 3 areas of your life that are important to you."),
        createAndStyleContainer("buttonContainer", [
          createAndStyleButton("button", "OK", advance),
        ])
      ])
      container.style.opacity = 0;
      stage.introduceOverlayContent(container);
    }

    function advance() {
      stage.removeOverlayContent(container);
    }
  }

  function Stage(stageElement) {
    var self = this;
    var wheelCanvas;
    var state;
    var transitionsEnabled = false;

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
      if (state && state.selectedAreas) return "chooseAreas";
      if (state) return "getStarted";
      return "default";
    }

    function openPhase(phaseName) {
      (function () {
        switch (phaseName) {
        case "getStarted":
          return new GetStartedController()
        case "chooseAreas":
          return new ChooseAreasController()
        default:
          return new DefaultController()
        }
      })().connect(self, transitionsEnabled);
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
    }

    /**
     * Called by a PhaseController to remove overlay content.
     */
    this.removeOverlayContent = function(container) {
      container.style.opacity = 0.0;
      window.setTimeout(function() { container.remove() }, 2500)
    }

    /**
     * Called by a PhaseController to advance to the next phase.
     */
    this.advance = function(phaseName) {
      openPhase(phaseName);
      saveState();
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

  function start() {
    const stageElement = document.querySelector(options.stageSelector);
    if (!stageElement.style.position) {
      stageElement.style.position = "relative";
    }
    new Stage(stageElement).start()
  }

  return { start: start }
});
LifeWheel.start();
