const getBaseDomain = async function (tabURL) {
  var tempUrl = new URL(tabURL);
  var baseDomain = tempUrl.hostname.replace("www.", "");

  return baseDomain;
};

const writeToLog = async function (msg) {
  console.log("Widify: " + msg);
};

/**
 * Retrieve object from Chrome's Local StorageArea
 * @param {string} key
 */
const getSetting = async function (key) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get(key, function (value) {
        resolve(value[key]);
      });
    } catch (ex) {
      reject(ex);
    }
  });
};

/**
 * Save Object in Chrome's Local StorageArea
 * @param {*} obj
 */
const saveSetting = async function (url, key, value) {
  var siteSetting = {};
  var siteOption = {};
  siteOption[key] = value;
  siteSetting[url] = siteOption;

  return new Promise((resolve, reject) => {
    try {
      getSetting(url).then((result) => {
        if (result) {
          if (key in result) {
            var siteTest = {};
            siteTest[url] = value;
            siteSetting[url] = siteTest;
          }
        }
      });
      chrome.storage.local.set(siteSetting, function () {
        resolve();
      });
    } catch (ex) {
      reject(ex);
    }
  });
};

/**
 * Removes Object from Chrome Local StorageArea.
 *
 * @param {string or array of string keys} keys
 */
const removeSetting = async function (keys) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.remove(keys, function () {
        resolve();
      });
    } catch (ex) {
      reject(ex);
    }
  });
};

export { writeToLog, getBaseDomain, getSetting, saveSetting, removeSetting };
