var storage = chrome.storage.local;

document.addEventListener(
  "DOMContentLoaded",
  function () {
    var checkButton = document.getElementById("save");
    checkButton.addEventListener(
      "click",
      function () {
        saveSettings();
      },
      false
    );

    var checkBoxes = document.getElementsByTagName("input");
    for (var checkbox of checkBoxes) {
      checkbox.addEventListener(
        "click",
        function () {
          hideSlider();
        },
        false
      );
    }

    storage.get(["widifySettings"], function (result) {
      var savedSettings = JSON.parse(
        JSON.stringify(result.widifySettings)
      ).split("|");
      for (var setting of savedSettings) {
        var value = setting.split(":");
        if (document.getElementById(value[0])) {
          document.getElementById(value[0]).checked = true;
        }
      }
    });
  },
  false
);

function saveSettings() {
  var settings = "";
  var markedCheckbox = document.querySelectorAll(
    'input[type="checkbox"]:checked'
  );
  for (var checkbox of markedCheckbox) {
    var site = checkbox.id;
    // Save using Chrome storage API
    settings += site + ":" + checkbox.value + "|";
  }

  storage.set(
    { widifySettings: (settings = settings.slice(0, -1)) },
    function () {
      toggleSlider();
    }
  );
}

function toggleSlider() {
  slide = document.querySelector(".slide");
  if (slide.classList.contains("slide-up")) {
    slide.classList.remove("slide-up");
  } else {
    slide.classList.add("slide-up");
  }
}

function hideSlider() {
  slide = document.querySelector(".slide");
  if (slide.classList.contains("slide-up")) {
    slide.classList.remove("slide-up");
  }
}
