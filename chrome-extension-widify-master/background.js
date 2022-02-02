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
          var baseDomain = tempUrl.hostname
            .substring(0, tempUrl.hostname.length - 4)
            .replace("www.", "");
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
        if (settingKey[0] === "auto") {
          chrome.scripting.executeScript({
            target: {
              tabId: tabId,
            },
            files: ["content.js"],
          });
        }

        if (settingKey[0] === baseDomain) {
          widify(baseDomain, tabId);
        }
      }
    }
  });
}

function widify(baseDomain, tabId) {
  chrome.scripting.insertCSS({
    files: ["/css/" + baseDomain + ".css"],
    target: {
      tabId: tabId,
    },
  });

  writeLog("Applied " + baseDomain + ".css to tab " + tabId);
}

function writeLog(msg) {
  console.log("Widify: " + msg);
}
