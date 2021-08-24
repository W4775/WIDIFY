var storage = chrome.storage.local;

document.addEventListener(
  "DOMContentLoaded",
  function () {
    getOptions();

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

    var allOptionToggle = document.getElementById("allOptionToggle");
    var filterOptions = document.getElementById("filterOptions");
    allOptionToggle.addEventListener(
      "click",
      function () {
        filterOptions.checked = true;
        alert(filterOptions.checked);
      },
      false
    );

    var filterOption = document.getElementById("filterInput");
    filterOption.addEventListener(
      "keyup",
      function () {
        filterOutOptions();
      },
      false
    );
  },
  false
);

function getOptions() {
  const url = chrome.runtime.getURL("data/options.json");

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      for (const site of data.sites) {
        setOptions(site);
      }
      storage.get(["widifySettings"], function (result) {
        if (result != {} && result.widifySettings) {
          var savedSettings = JSON.parse(
            JSON.stringify(result.widifySettings)
          ).split("|");
          for (var setting of savedSettings) {
            var value = setting.split(":");
            if (document.getElementById(value[0])) {
              document.getElementById(value[0]).checked = true;
            }
          }
        }
      });
    })
    .catch(console.error);
}

function setOptions(site) {
  var siteName = site.name.substring(0, site.name.length - 4);
  var ol = document.getElementById("optionsList");

  var li = document.createElement("LI");
  li.className = "option";

  var chkBox = document.createElement("INPUT");
  chkBox.setAttribute("type", "checkbox");
  chkBox.setAttribute("id", siteName);

  var label = document.createElement("label");
  label.htmlFor = siteName;

  var span1 = document.createElement("span");
  span1.innerHTML = siteName.toUpperCase();

  var span2 = document.createElement("span");

  label.appendChild(span1);
  label.appendChild(span2);
  li.appendChild(chkBox);
  li.appendChild(label);
  ol.appendChild(li);
}

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
    {
      widifySettings: (settings = settings.slice(0, -1)),
    },
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

function filterOutOptions() {
  // Declare variables
  var input, filter, ul, li, a, i, txtValue;
  input = document.getElementById("filterInput");
  filter = input.value.toUpperCase();
  ul = document.getElementById("optionsList");
  li = ul.getElementsByTagName("li");

  // Loop through all list items, and hide those who don't match the search query
  for (i = 0; i < li.length; i++) {
    a = li[i].getElementsByTagName("label")[0];
    if (a) {
      txtValue = a.textContent || a.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        li[i].style.display = "";
      } else {
        li[i].style.display = "none";
      }
    }
  }
}
