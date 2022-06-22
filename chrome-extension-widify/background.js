import { getBaseDomain, getSetting, saveSetting, writeToLog } from "./utils.js";

const storage = chrome.storage.local;
const lists = {
  whitelist: "Add to Whitelist",
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
      getBaseDomain(tab.url).then((result) => {
        checkForSiteSupport(result, tab.id);
        settingsCheck(tab);
      });
    }
  });
});

chrome.action.onClicked.addListener(function (tab) {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL("options.html"));
  }
  /*   getBaseDomain(tab.url).then((baseDomain) => {
    if (!baseDomain) return;
    getSetting(baseDomain).then((result) => {
      if (!result) return;
      let enabledSetting = result.some((x) => x["enabled"]);
      if (enabledSetting) {
        widify(baseDomain, tab, true);
        setIcon(false);
      } else {
        checkForSiteSupport(baseDomain, tab.id);
      }
    });
  }); */
});

chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.local.clear();
  /*  for (const key of Object.keys(lists)) {
    chrome.contextMenus.create({
      id: key,
      title: lists[key],
      type: "normal",
      contexts: ["all"],
    });
  } */
});

chrome.webNavigation.onCommitted.addListener(function (e) {
  if (e.frameId == 0) {
    chrome.tabs.query(
      {
        active: true,
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

function checkForSiteSupport(baseDomain, tabID) {
  const enabledKey = "enabled";
  let shouldReload = false;

  if (siteURLs.includes(baseDomain)) {
    getSetting(baseDomain).then((results) => {
      if (results) {
        let enabledSetting = results.some((x) => x["enabled"]);
        if (enabledSetting) {
          setIcon(enabledSetting);
          shouldReload = true;
        }
      } else {
        saveSetting(baseDomain, enabledKey, true);
        setIcon(true);
        shouldReload = true;
      }

      if (shouldReload) chrome.tabs.reload(tabID);
    });
  } else {
    setIcon(false);
  }
}

function applyAuto() {
  document.querySelectorAll("*").forEach(function (node) {
    var styles = window.getComputedStyle(node, null);

    if (styles.getPropertyValue("max-width") != "none") {
      node.style.setProperty("max-width", "none", "important");
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
  storage.get("auto", function (result) {
    if (result["auto"]) {
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: applyAuto,
        },
        () => {
          writeToLog("Applied AUTO to tab " + tab.id);
        }
      );
    }
  });
  getBaseDomain(tab.url).then((baseDomain) => {
    if (baseDomain) {
      getSetting(baseDomain).then((result) => {
        if (result) {
          let enabledSetting = result.some((x) => x["enabled"]);
          if (enabledSetting) {
            widify(baseDomain, tab);
          } else {
            widify(baseDomain, tab, true);
            setIcon(false);
          }

          if (siteURLs.includes(baseDomain)) {
            setIcon(enabledSetting);
          } else {
            widify(baseDomain, tab, true);
            setIcon(false);
          }
        }
      });
    }
  });
}

function widify(baseDomain, tab, isRemove = false) {
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      data.sites.map((site) => {
        if (site.baseURL === baseDomain) {
          Promise.all([fetch(site.cssURL).then((res) => res.text())]).then(
            ([css]) => {
              const siteName = baseDomain.substring(0, baseDomain.length - 4);
              if (isRemove) {
                chrome.scripting.removeCSS({
                  css: css,
                  target: {
                    tabId: tab.id,
                  },
                });
                saveSetting(baseDomain, "enabled", false);
                writeToLog("Removed " + siteName + ".css from tab " + tab.id);
              } else {
                chrome.scripting.insertCSS({
                  css: css,
                  target: {
                    tabId: tab.id,
                  },
                });
                writeToLog("Applied " + siteName + ".css to tab " + tab.id);
              }
            }
          );

          applyContentPadding(baseDomain, tab);
        }
      });
    });
}

function unwidify(tab) {
  chrome.scripting.removeCSS({
    tabId: tab.id,
  });
}

function applyContentPadding(baseDomain, tab) {
  getSetting(baseDomain).then((result) => {
    if (result) {
      let contentPadding = result.find((x) => x["content-padding"]);
      if (contentPadding) {
        chrome.scripting.executeScript(
          {
            target: { tabId: tab.id },
            func: setContentPadding,
            args: [contentPadding["content-padding"]],
          },
          () => {
            writeToLog("Applied Content Padding to tab " + tab.id);
          }
        );
      }
    }
  });
}

function setContentPadding(contentPadding) {
  let root = document.documentElement;
  root.style.setProperty(
    "--max-width",
    "calc(100% - " + contentPadding + "px)"
  );
}

/* Future feature

function addCropIcon() {
  let controls = Document.getElementsByClassName("ytp-buttons");
  let cropIcon = Document.createElement("button");
  cropIcon.innerHTML = "crop";
  cropIcon.onclick = function () {
    // set video to crop
  };
  cropIcon.insertBefore(cropIcon, controls[0]);
}

function addStretchIcon() {
  let controls = document.getElementsByClassName("ytp-buttons");
  let stretchIcon = document.createElement("button");
  stretchIcon.innerHTML = "crop";
  stretchIcon.onclick = function () {
    // set video to stretch
  };
  stretchIcon.insertBefore(stretchIcon, controls[0]);
}
*/
