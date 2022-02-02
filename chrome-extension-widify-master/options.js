const optionCardTemplate = document.querySelector("[data-option-template]");
const optionCardContainer = document.querySelector(
  "[data-option-cards-container]"
);
const searchInput = document.querySelector("[data-search]");
const url = chrome.runtime.getURL("data/options.json");
const storage = chrome.storage.local;
let options = [];

searchInput.addEventListener("input", (e) => {
  const value = e.target.value.toLowerCase();
  options.forEach((option) => {
    const isVisible =
      option.name.toLowerCase().includes(value) ||
      option.name.toLowerCase().includes(value);
    option.element.classList.toggle("hide", !isVisible);
  });
});

fetch(url)
  .then((res) => res.json())
  .then((data) => {
    const sites = data.sites;
    setOptions(sites);

    sites.forEach((site) => {
      if (local.get(site.baseURL)) {
        if (document.getElementById(site.baseURL)) {
          document.getElementById(site.baseURL).checked = true;
        }
      }
    });
  })
  .catch(console.error);

function setOptions(sites) {
  options = sites.map((site) => {
    const card = optionCardTemplate.content.cloneNode(true).children[0];
    const header = card.querySelector("[data-header]");
    const body = card.querySelector("[data-body]");
    const check = card.querySelector("[data-check");
    header.textContent = site.name.toUpperCase();
    body.textContent = site.cssURL;
    check.id = site.baseURL;
    check.addEventListener("click", (e) => {
      saveSetting(check);
    });
    optionCardContainer.append(card);
    return { name: site.name, email: site.name, element: card };
  });
}

function saveSetting(checkbox) {
  local.set(checkbox.id, checkbox.value);
}

var local = (function () {
  var setData = function (key, obj) {
    var values = JSON.stringify(obj);
    localStorage.setItem(key, values);
  };

  var getData = function (key) {
    if (localStorage.getItem(key) != null) {
      return JSON.parse(localStorage.getItem(key));
    } else {
      return false;
    }
  };

  var updateDate = function (key, newData) {
    if (localStorage.getItem(key) != null) {
      var oldData = JSON.parse(localStorage.getItem(key));
      for (keyObj in newData) {
        oldData[keyObj] = newData[keyObj];
      }
      var values = JSON.stringify(oldData);
      localStorage.setItem(key, values);
    } else {
      return false;
    }
  };

  return { set: setData, get: getData, update: updateDate };
})();
