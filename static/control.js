/**
 * The app.
 */
(function() {

  const createContainer = LifeWheel.createContainer;
  const createButton = LifeWheel.createButton;
  const createTextInput = LifeWheel.createTextInput;
  const createElement = LifeWheel.createElement;

  function createMessageContainer(styleClass, message) {
    var container = createElement("div", styleClass);
    container.innerHTML = message;
    return container;
  }

  LifeWheel.installController("default", function(stage) {
    this.connect = function() {
      stage.introduceOverlayContent(createScreen());
    }

    function createScreen() {
      var container = createContainer("screenOverlay", [
        createContainer("div", [
          createMessageContainer("bigBigMessage", "Feeling stuck?"),
          createMessageContainer("pseudoLink", "Click here.")
        ])
      ]);
      container.onclick = function() {
        stage.assignState({ clicked: true });
        stage.advance("getStarted")
      }
      return container;
    }
  });

  LifeWheel.installController("getStarted", Object.assign(function(stage) {
    this.connect = function(animate) {
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
          labelWheel("Wheel", "of", "Life");
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

    function labelWheel(a, b, c) {
      stage.getWheelCanvas().setLabel(5, a);
      stage.getWheelCanvas().setLabel(6, b);
      stage.getWheelCanvas().setLabel(7, c);
    }

    const DESCRIPTION = "" +
      "The Wheel of Life exercise is a popular life assessment tool, simple yet powerful.";
    const DESCRIPTION2 = "" +
      "It gives you a foundation for describing your overall life experience in terms of " +
      "your satisfaction in different areas important to you.";
    const DESCRIPTION3 = "" +
      "We'll step you through the construction of your wheel. " +
      "Click the button below to get started.";

    function addUI() {
      stage.introduceOverlayContent(createContainer("overlay", [
        createContainer("column", [
          createTopShaper(),
          createMessageContainer("normalText paragraph centered narrowest", DESCRIPTION),
          createMessageContainer("normalText paragraph centered narrower", DESCRIPTION2),
          createMessageContainer("normalText paragraph centered narrow", DESCRIPTION3),
          createContainer("buttonContainer", [
            createButton("button", "Get Started!", advance)
          ])
        ])
      ]));
    }

    function createTopShaper() {
      var container = createElement("div");
      var radius = stage.getWheelCanvas().getMetrics().radius;
      container.style.height = Math.floor(radius / 4) + "px";
      return container;
    }

    function advance() {
      stage.getWheelCanvas().setTransitionSpeed("fast");
      stage.getWheelCanvas().setPlacement(LifeWheel.WheelCanvas.PLACEMENT_OFFSTAGE);
      labelWheel("", "", "");
      stage.assignState({ selectedAreas: [] });
      stage.advance("preChooseAreas");
    }
  }, {
    acceptsState: function(state) {
      return !!state.clicked;
    }
  }));

  LifeWheel.installController("preChooseAreas", Object.assign(function(stage) {

    this.connect = function() {
      stage.introduceOverlayContent(createContainer("screenOverlay", [
        createMessageContainer("bigMessage",
            "Let's start by identifying the areas of your life <span style='color: #882299; font-weight: bold;'>most important</span> to you."),
        createContainer("buttonContainer", [
          createButton("button", "OK", advance),
        ])
      ]))
    }

    function advance() {
      stage.advance("chooseAreas");
    }
  }, {
    acceptsState: function(state) {
      return !!state.selectedAreas;
    }
  }));

  LifeWheel.installController("chooseAreas", Object.assign(function(stage) {

    const SUGGESTIONS = [
      "Love", "Romance", "Partner", "Home", "Family",
      "Career", "Studies", "Business", "Money", "Finances",
      "Development", "Connection", "Social", "Friends",
      "Inner Peace", "Spirituality", "Contribution", "Life Purpose",
      "Self-Image", "Health", "Fitness", "Fun", "Recreation"
    ]

    function getSelectedAreas() {
      if (!stage.getState().selectedAreas) {  // in case of goto
        stage.assignState({ selectedAreas: [] })
      }
      return stage.getState().selectedAreas;
    }

    this.connect = function() {
      // TODO: reimplement in React.  This is silly.
      var remainingCount = LifeWheel.NSECTIONS - getSelectedAreas().length;

      function updateAddButtonDisabled() {
        addButton.disabled = textInputElement.value.length == 0;
      }

      function addSelection() {
        const value = textInputElement.value;
        resetTextInput();
        if (value.length && !getSelectedAreas().includes(value)) {
          showNewSelection(value);
          stage.assignState({ selectedAreas: getSelectedAreas().concat([ value ]) })
          updateRemainingCount(-1);
        }
      }

      function updateRemainingCount(incr) {
        remainingCount += incr;
        countElement.innerHTML = remainingCount.toString();
        if (remainingCount == 0) {
          textInputBox.style.display = "none";
          promptElement.style.display = "none";
          advanceElement.style.display = "block";
        }
        else {
          textInputBox.style.display = "block";
          promptElement.style.display = "block";
          advanceElement.style.display = "none";
        }
      }

      function resetTextInput() {
        textInputElement.value = "";
        updateAddButtonDisabled();
      }

      function showNewSelection(value) {
        var label = createElement("span", "selectionLabel");
        label.appendChild(document.createTextNode(value))

        var button = createButton("deleteButton", "X", function() {
          stage.assignState({ selectedAreas: getSelectedAreas().filter((ele) => ele != value) });
          selectionElement.remove();
          updateRemainingCount(1);
        })

        var selectionElement = createContainer("selectionElement", [ label, button ]);
        textInputBox.parentNode.insertBefore(selectionElement, textInputBox)
      }

      var titleBar = createMessageContainer(
          "titleBar centered italic", "What are the important areas of my life?");

      var textInputElement = createTextInput("textInput inputText", "Type something", function() {
        updateAddButtonDisabled()
      })
      textInputElement.onkeydown = function(e) {
        if (e.key === "Enter" || e.keyCode === 13) {
          addSelection();
        }
      }

      var addButton = createButton("button inputText", "&#x2713", addSelection);
      updateAddButtonDisabled();

      var textInputBox = createContainer("row", [ textInputElement, addButton ]);
      var inputPanel = createContainer("halfWidth", [ textInputBox ]);

      var suggestionsLabel = createElement("span", "boxLabel");
      suggestionsLabel.innerHTML = "Suggestions";

      var suggestionElements = []
      for (var i in SUGGESTIONS) {
        if (i > 0) {
          suggestionElements.push(document.createTextNode(", "))
        }
        suggestionElements.push((function(label) {
          return createButton("linkButton", label, function() {
            textInputElement.value = label;
            addButton.disabled = false;
          })
        })(SUGGESTIONS[i]));
      }
      var suggestionsBox = createContainer("borderBox", suggestionElements)
      var suggestionsPanel = createContainer("halfWidth", [ suggestionsLabel, suggestionsBox ])

      var body = createContainer("flow", [ inputPanel, suggestionsPanel ])

      var countElement = createElement("span", "bold")

      var promptElement = createContainer("titleBar centered", [
        countElement, document.createTextNode(" more to go!")
      ])

      var advanceElement = createContainer("buttonContainer centered", [
        createButton("button", "I'm good with these!", handleAdvance)
      ])

      const ui = createContainer("", [ titleBar, body, promptElement, advanceElement ])

      for (var i in getSelectedAreas()) {
        showNewSelection(getSelectedAreas()[i]);
      }
      updateRemainingCount(0);

      stage.introduceOverlayContent(createContainer("overlay", [ ui ]));

      window.setTimeout(function() {
        textInputElement.focus()
      }, 100)
    }

    function handleAdvance() {
      stage.assignState({ wheel: null })
      stage.getWheelCanvas().setState({});  // clear state.
      for (var i in getSelectedAreas()) {
        stage.getWheelCanvas().setLabel(i, getSelectedAreas()[i]);
      }
      stage.assignState({ wheel: stage.getWheelCanvas().getState() })
      stage.advance("showWheel");
    }
  }, {
    acceptsState: function(state) {
      return state.selectedAreas && state.selectedAreas.length > 0;
    }
  }));

  LifeWheel.installController("showWheel", Object.assign(function(stage) {
    this.connect = function(animate) {
      var step = 0;
      var interval;
      console.log(stage.getState())

      stage.getWheelCanvas().setState(stage.getState().wheel);
      if (animate) {
        stage.getWheelCanvas().setTransitionSpeed("slow");
        stage.getWheelCanvas().setPlacement(LifeWheel.WheelCanvas.PLACEMENT_OFFSTAGE);
        interval = window.setInterval(doIntroStep, 350);
      }
      else {
        for (var i = 0; i <= 8; ++i) {
          doIntroStep();
        }
      }
      stage.getWheelCanvas().setVisible(true);

      function doIntroStep() {
        switch (step) {
        case 0:
          stage.getWheelCanvas().setPlacement(LifeWheel.WheelCanvas.PLACEMENT_NEUTRAL);
          break;
        case 1:
          stage.getWheelCanvas().setCurrentSection(4);
          break;
        case 6:
          stage.getWheelCanvas().setCurrentSection(0);
          stage.getWheelCanvas().setPlacement(LifeWheel.WheelCanvas.PLACEMENT_STAGE_LEFT);
          break;
        case 8:
          window.clearInterval(interval);
          addUI()
        }
        ++step;
      }
    }

    function addUI() {
      var currentSection = 0;
      const wcanvas = stage.getWheelCanvas();

      function updateCompletedness() {
        var state = wcanvas.getState();
        var count = 0;
        for (var i = 0; i < state.values.length; ++i) {
          if (state.values[i] != null) ++count;
        }
        if (count == LifeWheel.NSECTIONS) {
          advanceButtonContainer.style.display = "block";
        }
      }

      function updateCurrentSection(newCurrentSection) {
        wcanvas.setTransitionSpeed("medium");
        currentSection = newCurrentSection;
        wcanvas.setCurrentSection(currentSection);
        areaLabel.innerHTML = "";
        areaLabel.appendChild(document.createTextNode(wcanvas.getState().labels[currentSection]));
        numberPicker.value = wcanvas.getState().values[currentSection] || 0;
      }

      const numberPicker = createElement("input", "inputText");
      numberPicker.type = "number";
      numberPicker.min = 0;
      numberPicker.max = 10;
      numberPicker.step = 1;
      numberPicker.value = 0;
      numberPicker.onchange = function() {
        wcanvas.setTransitionSpeed("medium");
        wcanvas.setValue(currentSection, parseInt(numberPicker.value))
        stage.assignState({ wheel: wcanvas.getState() });
        updateCompletedness();
      }

      var rotateLeftButton = createButton("button", "&#x27f2;", function() {
        updateCurrentSection((currentSection + 7) % 8);
      });
      var rotateRightButton = createButton("button", "&#x27f3;", function() {
        updateCurrentSection((currentSection + 1) % 8);
      });

      const areaLabel = createMessageContainer("bigMessage bold", "") 

      const nextLabel = createElement("span", "normalText")
      nextLabel.innerHTML = "&nbsp; rotate &nbsp;";

      const advanceButtonContainer = createContainer("buttonContainer", [
        createButton("button", "Next >", advance)
      ]);
      advanceButtonContainer.style.display = "none";

      updateCurrentSection(0);
      updateCompletedness();

      stage.introduceOverlayContent(createContainer("rightHalf", [
        createMessageContainer("titleBar", "How satisfied are you?"),
        createMessageContainer("normalText", "Rate your satisfaction level (0..10) in"),
        areaLabel,
        createContainer("div", [ numberPicker ]),
        createContainer("div", [ rotateLeftButton, nextLabel, rotateRightButton ]),
        advanceButtonContainer
      ]));
    }

    function advance() {
      stage.advance("freeform");
    }
  }, {
    acceptsState: function(state) {
      return !!state.wheel;
    }
  }));

  LifeWheel.installController("freeform", Object.assign(function(stage) {

    this.connect = function() {
      stage.introduceOverlayContent(createContainer("screenOverlay", [
        createMessageContainer("bigMessage", "That's all for this demo!"),
        createMessageContainer("paragraph centered normalText", "Future versions will allow user to enter descriptions of each area, propose action items, contact a coach, get a printable PDF of their wheel.")
      ]))
    }
  }, {
    acceptsState: function(state) {
      return false;
    }
  }));

  LifeWheel.start();
})();
