var supportedSites = {
  "amazon.com": "amazon.css",
  "gamestop.com": "gamestop.css",
  "github.com": "github.css",
  "reddit.com": "reddit.css",
  "slickdeals.net": "slickdeals.css",
  "target.com": "target.css",
  "walmart.com": "walmart.css",
};

chrome.webNavigation.onCommitted.addListener(
  function (e) {
    chrome.tabs.query(
      {
        active: true,
        lastFocusedWindow: true,
      },
      function (tabs) {
        tabCheck(tabs[0]);
      }
    );
  },
  {
    url: [
      { hostSuffix: "amazon.com" },
      { hostSuffix: "gamestop.com" },
      { hostSuffix: "github.com" },
      { hostSuffix: "reddit.com" },
      { hostSuffix: "slickdeals.net" },
      { hostSuffix: "target.com" },
      { hostSuffix: "walmart.com" },
      { hostSuffix: "slickdeals.net" },
    ],
  }
);

function tabCheck(tab) {
  for (var site in supportedSites) {
    if (tab.url.indexOf(site) != -1) {
      settingsCheck(site, tab);
    }
  }
}

function settingsCheck(site, tab) {
  chrome.storage.local.get(["widifySettings"], function (result) {
    var savedSettings = JSON.parse(JSON.stringify(result.widifySettings)).split(
      "|"
    );
    for (var setting of savedSettings) {
      var value = setting.split(":");
      if (site && value[0] && site.indexOf(value[0]) != -1) {
        widify(supportedSites[site], tab.id);
      }
    }
  });
}

function widify(siteCSS, tabId) {
  chrome.scripting.insertCSS({
    files: ["/css/" + siteCSS],
    target: { tabId: tabId },
  });

  writeLog("Applied " + siteCSS + " to tab " + tabId);
}

function writeLog(msg) {
  console.log("Widify: " + msg);
}
