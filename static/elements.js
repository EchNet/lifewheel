/**
 * Support creation and purposing of DOM elements.
 * Exports:
 * LifeWheel.createElement(tag, styleClass)
 * LifeWheel.createElement(tag, styleClass)
 */
LifeWheel.define(function(options) {
  const defaultOptions = { fontFamily: "Verdana,Arial" }
  options = Object.assign({}, defaultOptions, options);

  /**
   * DOM/styling helper.
   */
  function createElement(tag, styleClasses) {
    var element = document.createElement(tag)

    var styler = function(style, value) {
      element.style[style] = value;
      return styler;
    }

    styleClasses = styleClasses || [];
    if (!Array.isArray(styleClasses)) {
      styleClasses = styleClasses.split(" ");
    }

    for (var i in styleClasses) {
      switch (styleClasses[i]) {
      case "button":
        styler(
          "padding", "4px 8px")(
          "fontFamily", options.fontFamily)(
          "fontSize", "20px")(
          "marginLeft", "1px")(
          "marginRight", "1px")
        break;
      case "deleteButton":
        styler(
          "padding", "0 4px")(
          "fontSize", "18px")(
          "marginLeft", "2px")
        break;
      case "textInput":
        styler(
          "width", "200px")(
          "border", "solid 1px #45c5c5")(
          "borderRadius", "8px")(
          "padding", "4px 8px")(
          "boxSizing", "border-box")
        break;
      case "inputText":
        styler(
          "color", "black")(
          "fontFamily", options.fontFamily)(
          "fontSize", "18px")(
          "fontWeight", 300)(
          "border", "solid 2px #45a5c5")(
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
          "fontFamily", options.fontFamily)(
          "color", "#444")(
          "fontWeight", "normal")(
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
          "fontSize", "24px")(
          "letterSpacing", "1px")(
          "fontFamily", options.fontFamily)(
          "fontWeight", 400)(
          "color", "#777")(
          "marginTop", "6px")(
          "marginBottom", "18px")
        break;
      case "selectionElement": 
        styler(
          "fontSize", "18px")(
          "fontFamily", options.fontFamily)(
          "borderRadius", "8px")(
          "margin", "2px")(
          "padding", "2px")
        break;
      case "italic":
        styler(
          "fontStyle", "italic")
        break;
      case "bold":
        styler(
          "fontWeight", 550)(
          "color", "#982098")
        break;
      case "inputContainer":
        styler("marginBottom", "24px")
        break;
      case "buttonContainer":
        styler("display", "flex")("justifyContent", "space-around")("marginTop", "30px")
        break;
      case "boxLabel":
        styler(
          "backgroundColor", "white")(
          "position", "relative")(
          "top", "20px")(
          "left", "25px")(
          "padding", "0 5px")(
          "color", "#982098")(
          "fontFamily", options.fontFamily)
        break;
      case "borderBox":
        styler(
          "border", "solid 2px #982098")(
          "fontHeight", "16px")(
          "borderRadius", "12px")(
          "lineHeight", "1.54")(
          "margin", "12px")(
          "padding", "12px")
        break;
      case "flow":
        styler("display", "flex")("justifyContent", "space-between")
        break;
      case "halfWidth":
        styler("width", "340px")("position", "relative")
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
          "flexDirection", "column")(
          "justifyContent", "center")(
          "alignItems", "center")(
          "transition", "opacity 1.3s ease-in-out")
        break;
      case "screenOverlay":
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
          "position", "absolute")(
          "top", "100px")(
          "left", "120px")(
          "right", "120px")(
          "flexDirection", "column")(
          "justifyContent", "center")(
          "alignItems", "center")(
          "padding", 0)(
          "transition", "opacity 1.3s ease-in-out")
        break;
      case "centered":
        styler("textAlign", "center")
        break;
      }
    }
    return element;
  }

  function createButton(styleClass, label, clickHandler) {
    var button = createElement("button", styleClass)
    button.type = "button";
    button.innerHTML = label;
    button.onclick = clickHandler;
    return button;
  }

  function createTextInput(styleClass, placeholder, inputHandler) {
    var input = createElement("input", styleClass)
    input.type = "text";
    input.placeholder = placeholder;
    input.oninput = inputHandler;
    input.maxlength = 20;
    return input;
  }

  function createContainer(styleClass, children) {
    var container = createElement("div", styleClass);
    for (var i = 0; i < children.length; ++i) {
      container.appendChild(children[i]);
    }
    return container;
  }

  return {
    createElement: createElement,
    createButton: createButton,
    createTextInput: createTextInput,
    createContainer: createContainer
  }
});
