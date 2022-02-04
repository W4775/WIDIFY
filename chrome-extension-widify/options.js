const optionCardTemplate = document.querySelector("[data-option-template]");
const optionCardContainer = document.querySelector(
  "[data-option-cards-container]"
);
const searchInput = document.querySelector("[data-search]");
const btnSuggestionSubmit = document.querySelector("[data-suggestion-submit]");
const suggestionInput = document.querySelector("[data-suggestion-value]");

const url = chrome.runtime.getURL("data/options.json");
const storage = chrome.storage.local;

const githubURL =
  "https://github.com/W4775/Widify/discussions/new?category=ideas";

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

btnSuggestionSubmit.addEventListener("click", (e) => {
  submitSuggestion(suggestionInput.value);
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
    const cssSource = card.querySelector("[data-css-source-value]");
    const checkbox = card.querySelector("[data-check]");
    header.textContent = site.name.toUpperCase();
    cssSource.value = site.cssURL;
    checkbox.id = site.baseURL;
    checkbox.addEventListener("click", (e) => {
      saveSetting(checkbox);
    });
    checkbox.checked = false;
    storage.get(checkbox.id, function (result) {
      checkbox.checked = result[site.baseURL];
    });
    optionCardContainer.append(card);
    return { name: site.name, email: site.name, element: card };
  });
}

function saveSetting(checkbox) {
  var obj = {};
  obj[checkbox.id] = checkbox.checked;
  storage.set(obj);
}

function submitSuggestion(siteBaseUrl) {
  const title_value = "Request add new site specific CSS for " + siteBaseUrl;
  const title_param = "&title=" + title_value;
  const body_param = "&body=" + title_value;

  window.open(githubURL + title_param + body_param, "AddASuggestion", "popup");
  suggestionInput.value = "";
}
