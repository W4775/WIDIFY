import { getBaseDomain, saveSetting, writeLog } from "./utils.js";

const storage = chrome.storage.local;
const lists = {
  whitelist: "Add to Whitelist",
  blacklist: "Add to Blacklist",
};
const url =
  "https://raw.githubusercontent.com/W4775/WIDIFY-CONFIGS/main/data/options.json";
let siteURLs = [];

fetch(url)
  .then((res) => res.json())
  .then((data) => {
    const sites = data.sites;
    sites.forEach((site) => {
      siteURLs.push(site.baseURL);
    });
  })
  .catch(console.error);

chrome.tabs.onActivated.addListener(function (activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function (tab) {
    if (tab && tab.url) {
      const baseDomain = getBaseDomain(tab.url);
      checkForSiteSupport(baseDomain, tab.id, false, false);
    }
  });
});

chrome.action.onClicked.addListener(function (tab) {
  const baseDomain = getBaseDomain(tab.url);
  checkForSiteSupport(baseDomain, tab.id, true, true);
});

chrome.runtime.onInstalled.addListener(function () {
  for (const key of Object.keys(lists)) {
    chrome.contextMenus.create({
      id: key,
      title: lists[key],
      type: "normal",
      contexts: ["all"],
    });
  }
});

chrome.webNavigation.onCommitted.addListener(function (e) {
  if (e.frameId == 0) {
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      function (tabs) {
        var tab = tabs[0];
        if (tab && tab.url) {
          settingsCheck(tab);
        }
      }
    );
  }
});

function checkForSiteSupport(baseDomain, tabID, isSave, isInverse) {
  storage.get(baseDomain, function (result) {
    if (result) {
      let resVal = isInverse ? !result[baseDomain] : result[baseDomain];
      if (isSave) {
        saveSetting(baseDomain, resVal);
        chrome.tabs.reload(tabID);
      }

      if (siteURLs.includes(baseDomain)) {
        setIcon(resVal);
      } else {
        setIcon(false);
      }
    }
  });
}

function setIcon(isEnabled) {
  if (isEnabled) {
    chrome.action.setIcon({ path: "./images/icon19.png" });
  } else {
    chrome.action.setIcon({ path: "./images/icon19-disabled.png" });
  }
}

function settingsCheck(tab) {
  const baseDomain = getBaseDomain(tab.url);
  storage.get(baseDomain, function (result) {
    if (result) {
      if (result[baseDomain]) {
        widify(baseDomain, tab.id);
      }
      if (siteURLs.includes(baseDomain)) {
        setIcon(result[baseDomain]);
      } else {
        setIcon(false);
      }
    }
  });
}

function widify(baseDomain, tabId) {
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      data.sites.map((site) => {
        if (site.baseURL === baseDomain) {
          Promise.all([fetch(site.cssURL).then((res) => res.text())]).then(
            ([css]) => {
              const siteName = baseDomain.substring(0, baseDomain.length - 4);
              chrome.scripting.insertCSS({
                css: css,
                target: {
                  tabId: tabId,
                },
              });
              writeLog("Applied " + siteName + ".css to tab " + tabId);
            }
          );
        }
      });
    });
}
