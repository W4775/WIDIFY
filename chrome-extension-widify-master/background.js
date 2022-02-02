const kLocales = {
  whitelist: "whitelist site",
  blacklist: "blacklist site",
};

chrome.action.onClicked.addListener(function (tab) {
  chrome.action.setTitle({ tabId: tab.id, title: "You are on tab:" + tab.id });
  chrome.action.setBadgeText({ text: "ON" });
  chrome.action.setBadgeBackgroundColor({ color: "#4688F1" });
  chrome.action.disable();
});

chrome.runtime.onInstalled.addListener(function () {
  console.log("oninstall");
  for (const key of Object.keys(kLocales)) {
    chrome.contextMenus.create({
      id: key,
      title: kLocales[key],
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
          var tempUrl = new URL(tab.url);
          var baseDomain = tempUrl.hostname.replace("www.", "");
          settingsCheck(baseDomain, e.tabId);
        }
      }
    );
  }
});

function settingsCheck(baseDomain, tabId) {
  chrome.storage.local.get(["widifySettings"], function (result) {
    if (result != {} && result.widifySettings) {
      var savedSettings = JSON.parse(
        JSON.stringify(result.widifySettings)
      ).split("|");

      for (var setting of savedSettings) {
        var settingKey = setting.split(":");
        /*  if (settingKey[0] === "auto") {
          chrome.scripting.executeScript({
            target: {
              tabId: tabId,
            },
            files: ["content.js"],
          });
        } */
        if (settingKey[0] === baseDomain) {
          widify(baseDomain, tabId);
        }
      }
    }
  });
}

function widify(baseDomain, tabId) {
  const url = chrome.runtime.getURL("data/options.json");
  let css = "";
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

function writeLog(msg) {
  console.log("Widify: " + msg);
}
