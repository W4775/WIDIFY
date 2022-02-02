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
      storage.get(site.baseURL, function (result) {
        if (document.getElementById(site.baseURL)) {
          document.getElementById(site.baseURL).checked = result[site.baseURL];
        }
      });
    });
  })
  .catch(console.error);

function setOptions(sites) {
  options = sites.map((site) => {
    const card = optionCardTemplate.content.cloneNode(true).children[0];
    const header = card.querySelector("[data-header]");
    const body = card.querySelector("[data-body]");
    const checkbox = card.querySelector("[data-check");
    header.textContent = site.name.toUpperCase();
    body.textContent = site.cssURL;
    checkbox.id = site.baseURL;
    checkbox.addEventListener("click", (e) => {
      saveSetting(checkbox);
    });
    checkbox.checked = false;
    storage.get(checkbox.id, function (result) {
      console.log(result[site.baseURL]);
      checkbox.checked = result[site.baseURL];
    });
    optionCardContainer.append(card);
    return { name: site.name, email: site.name, element: card };
  });
}

function saveSetting(checkbox) {
  /*   storage.get(checkbox.id, function (result) {
    var obj = {};
    obj[checkbox.id] = checkbox.checked;
    storage.set(obj);
  }); */
  var obj = {};
  obj[checkbox.id] = checkbox.checked;
  storage.set(obj);
}
