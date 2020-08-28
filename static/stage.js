/**
 * Exports: start
 */
LifeWheel.define(function(options) {
  const containerSelector = options.containerSelector || ".canvasContainer";

  function start() {
    var canvas = document.createElement("canvas")
    canvas.width = 1260;
    canvas.height = 630;
    canvas.style.width = "100%";
    canvas.style.height = "100%";

    document.querySelector(containerSelector).style.position = "relative";
    document.querySelector(containerSelector).appendChild(canvas);
    document.querySelector(containerSelector).appendChild(canvas);

    var wheelCanvas = new LifeWheel.WheelCanvas(canvas);
    var wheelState = JSON.parse(localStorage.getItem("state"));
    if (wheelState) {
      wheelCanvas.setState(wheelState);
    }
    wheelCanvas.setVisible(true);

    // TEST
    canvas.onclick = function(event) {
      wheelCanvas.setPlacement(Math.floor(Math.random() * 4))
      wheelCanvas.setCurrentSection(Math.floor(Math.random() * 8))
      wheelCanvas.setValue(0, Math.floor(Math.random() * 11))
    }
  }

  function saveWheelState() {
    localStorage.setItem("state", JSON.stringify(localWheelRenderParams))
  }

  return { start: start }
});
LifeWheel.start();
