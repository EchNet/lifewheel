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
        "fontSize", "16px")
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
    case "bigBigMessage":
      styler(
        "textAlign", "center")(
        "fontSize", "64px")(
        "color", "violet")(
        "fontFamily", options.fontFamily)(
        "fontWeight", "bold")(
        "marginTop", "24px")(
        "marginBottom", "24px")
      break;
    case "pseudoLink":
      styler(
        "textAlign", "center")(
        "fontSize", "16px")(
        "textDecoration", "underline")(
        "color", "#999")(
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
      styler("display", "flex")("justifyContent", "space-around")
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
        "justifyContent", "center")(
        "alignItems", "center")(
        "transition", "opacity 1.5s ease-in-out")
      break;
    }
    return element;
  }

  function createAndStyleButton(styleClass, label, clickHandler) {
    var button = createAndStyleElement("button", styleClass)
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

  function DefaultPhaseController() {
    var stage;
    var container;

    this.connect = function(pStage) {
      stage = pStage;
      addChildElements();
    }

    this.disconnect = function() {
      container.remove();
    }

    function addChildElements() {
      container = createAndStyleContainer("overlay", [
        createAndStyleContainer("div", [
          createMessageContainer("bigBigMessage", "Stuck?"),
          createMessageContainer("pseudoLink", "Click here.")
        ])
      ]);
      stage.getStageElement().appendChild(container);
      container.onclick = handleClick;
    }

    function handleClick() {
      container.style.opacity = 0;
      stage.transition(new GetStartedTransition(), { name: "chooseAreas" })
    }
  }

  function GetStartedTransition() {
    const SAMPLES = [ "Home", "Family", "Career", "Spirituality", "Health", "Partner", "Finances", "Fun" ]
    const WHAMPLES = [ "Wheel", "of", "Life", "", "", "", "", "" ]
    this.play = function(stage, callback) {
      var step = 0;
      for (var i = 0; i < 8; ++i) {
        stage.getWheelCanvas().setLabel(i, SAMPLES[i])
      }
      stage.getWheelCanvas().setPlacement(LifeWheel.WheelCanvas.PLACEMENT_OFFSTAGE);
      var interval = window.setInterval(function() {
        switch (step) {
        case 0:
          stage.getWheelCanvas().setVisible(true);
          break;
        case 1:
          stage.getWheelCanvas().setPlacement(LifeWheel.WheelCanvas.PLACEMENT_NEUTRAL);
        case 3:
          stage.getWheelCanvas().setCurrentSection(7);
          break;
        case 7:
          stage.getWheelCanvas().setPlacement(LifeWheel.WheelCanvas.PLACEMENT_CENTER_STAGE);
          for (var i = 0; i < 8; ++i) {
            stage.getWheelCanvas().setLabel(i, WHAMPLES[i])
          }
          break;
        case 10:
          window.clearInterval(interval);
          callback()
        }
        if (step >= 3) {
          stage.getWheelCanvas().setValue(step - 3, 10);
        }
        ++step;
      }, 320)
    }
  }

  function GetStartedPhaseController() {
    var stage;

    this.connect = function(pStage) {
      stage = pStage;
    }

    this.disconnect = function() {
    }
  }

  function ChooseAreasPhaseController() {
    var stage;

    this.connect = function(pStage) {
      stage = pStage;
    }

    this.disconnect = function() {
    }
  }

  function Stage(stageElement) {

    var self = this;
    var wheelCanvas;
    var phaseController;
    var phaseData;

    function createWheelCanvas() {
      var canvas = document.createElement("canvas")
      canvas.width = 1260;
      canvas.height = 630;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      stageElement.appendChild(canvas);
      wheelCanvas = new LifeWheel.WheelCanvas(canvas);
    }

    function controllerForPhase() {
      switch (phaseData.name) {
      case "getStarted":
        return new GetStartedPhaseController()
      case "chooseAreas":
        return new ChooseAreasPhaseController()
      default:
        return new DefaultPhaseController()
      }
    }

    function savePhaseData() {
      localStorage.setItem("state", JSON.stringify(phaseData))
    }

    function restorePhaseData() {
      if (window.location.hash != "#clear") {
        phaseData = JSON.parse(localStorage.getItem("state"))
      }
      phaseData = phaseData || { name: "default" };
    }

    function openPhase() {
      if (phaseController) phaseController.disconnect();
      savePhaseData();
      phaseController = controllerForPhase();
      phaseController.connect(self);
    }

    this.start = function() {
      createWheelCanvas();
      restorePhaseData();
      if (phaseData.wheel) {
        wheelCanvas.setState(phaseData.wheel);
      }

      openPhase();
    }

    this.getStageElement = function() {
      return stageElement;
    }

    this.getWheelCanvas = function() {
      return wheelCanvas;
    }

    this.getPhaseData = function() {
      return phaseData;
    }

    this.transition = function(transition, newPhaseData) {
      phaseData = newPhaseData;
      transition.play(self, openPhase);
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
