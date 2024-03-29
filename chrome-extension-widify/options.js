import { getBaseDomain, saveSetting, writeToLog, getSetting } from "./utils.js";

const storage = chrome.storage.local;
const optionCardTemplate = document.querySelector("[data-option-template]");
const optionCardContainer = document.querySelector(
  "[data-option-cards-container]"
);
const searchInput = document.querySelector("[data-search]");
const autoOption = document.querySelector("[data-auto]");

const btnSuggestionSubmit = document.querySelector("[data-suggestion-submit]");
const suggestionInput = document.querySelector("[data-suggestion-value]");
const btnAddToBlacklist = document.querySelector("[data-add-to-blacklist]");

const darkToggle = document.querySelector("[data-option-dark]");
const lightToggle = document.querySelector("[data-option-light]");

var htmlElement = document.getElementsByTagName("html")[0];

const optionsUrl =
  "https://raw.githubusercontent.com/W4775/WIDIFY-CONFIGS/main/data/options.json";

const issueURL = "https://github.com/W4775/WIDIFY-CONFIGS/issues/new?";
const suggestionURL =
  "https://github.com/W4775/Widify/discussions/new?category=ideas";

let options = [];
suggestionInput.value = "";

async function getOptions() {
  await fetch(optionsUrl)
    .then((res) => res.json())
    .then((data) => {
      const sites = data.sites;
      setOptions(sites);
      setTheme();
      sites.forEach((site) => {
        getSetting(site.baseURL).then((result) => {
          if (!result) return;

          let enabledSetting = result.find((x) => x.enabled);
          if (!enabledSetting) return;

          document.getElementById(site.baseURL).checked =
            enabledSetting["enabled"];
        });
      });
    })
    .catch(console.error);
}

searchInput.addEventListener("input", (e) => {
  const value = e.target.value.toLowerCase();
  options.forEach((option) => {
    const isVisible = option.name.toLowerCase().includes(value);
    option.element.classList.toggle("hide", !isVisible);
  });
});

btnSuggestionSubmit.addEventListener("click", (e) => {
  submitSuggestion(suggestionInput.value);
});

btnAddToBlacklist.addEventListener("click", (e) => {
  addItem();
});

autoOption.addEventListener("click", (e) => {
  saveSetting("auto", autoOption.checked);
});

lightToggle.addEventListener("click", (e) => {
  htmlElement.classList.remove("dark");
  htmlElement.classList.add("light");
  chrome.storage.local.set({ theme: "light" }, () => {});
});

darkToggle.addEventListener("click", (e) => {
  htmlElement.classList.remove("light");
  htmlElement.classList.add("dark");
  chrome.storage.local.set({ theme: "dark" }, () => {});
});

function setOptions(sites) {
  options = sites.map((site) => {
    const card = optionCardTemplate.content.cloneNode(true).children[0];
    const header = card.querySelector("[data-header]");
    const body = card.querySelector("[data-body]");
    const cssSource = card.querySelector("[data-css-source-value]");
    const checkbox = card.querySelector("[data-check]");
    const btnIssueSubmit = card.querySelector("[data-issue-submit]");
    const padding = card.querySelector("[data-padding-value");

    const headerSpan = document.createElement("span");
    const headerLink = document.createElement("a");

    headerLink.setAttribute("href", `http://www.${site.baseURL}`);
    headerLink.setAttribute("target", "_blank");
    headerLink.textContent = site.name.toUpperCase();

    headerSpan.appendChild(headerLink);

    header.appendChild(headerSpan);
    cssSource.value = site.cssURL;
    checkbox.id = site.baseURL;
    padding.value = 0;
    checkbox.checked = false;

    checkbox.addEventListener("click", (e) => {
      saveSetting(checkbox.id, "enabled", checkbox.checked);
    });

    padding.addEventListener("input", (e) => {
      saveSetting(checkbox.id, "content-padding", padding.value);
    });

    btnIssueSubmit.addEventListener("click", (e) => {
      submitIssue(site.baseURL);
    });

    getSetting(checkbox.id).then((result) => {
      if (!result) return;

      let enabledSetting = result.find((x) => x["enabled"]);
      if (enabledSetting) checkbox.checked = enabledSetting["enabled"];

      let paddingSetting = result.find((x) => x["content-padding"]);
      if (paddingSetting) padding.value = paddingSetting["content-padding"];
    });

    optionCardContainer.append(card);
    return { name: site.name, element: card };
  });

  storage.get("auto", function (result) {
    autoOption.checked = result["auto"];
  });
}

function submitSuggestion(siteBaseUrl) {
  if (siteBaseUrl.trim() === "") return;

  const title_value = `Request add new site specific CSS for ${siteBaseUrl}`;
  const title_param = `&title=${title_value}`;
  const body_param = `&body=${title_value}`;

  window.open(
    suggestionURL + title_param + body_param,
    "AddASuggestion",
    "popup"
  );

  suggestionInput.value = "";
}

function submitIssue(siteBaseUrl) {
  if (siteBaseUrl.trim() === "") return;
  const title_value = "Issue with " + siteBaseUrl + " css";

  const title_param = "title=" + title_value;
  const body_param = "&body=" + "<!-- describe the issue below -->";

  window.open(issueURL + title_param + body_param, "AddAIssue", "popup");
}

function setTheme() {
  getSetting("theme").then((result) => {
    const classList = htmlElement.classList;

    if (result) {
      classList.remove("light");
      classList.remove("dark");
      classList.add(result);
    } else {
      chrome.storage.local.set({ theme: "light" }, () => {});
      classList.remove("light");
      classList.remove("dark");
      classList.add("light");
    }
  });
}

function addItem() {
  let input = document.getElementById("txtBlacklist");
  let text = input.value;
  let newLi = document.createElement("li");
  newLi.textContent = text + " ";
  let deleteLink = document.createElement("a");

  deleteLink.textContent = "[Delete]";
  deleteLink.href = "#";
  deleteLink.addEventListener("click", deleteItem);

  newLi.appendChild(deleteLink);

  document.getElementById("blacklist").appendChild(newLi);
  input.value = "";

  function deleteItem() {
    document.getElementById("blacklist").removeChild(newLi);
  }
}

getOptions();
