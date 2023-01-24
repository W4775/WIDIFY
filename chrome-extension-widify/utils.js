const getBaseDomain = async function (tabURL) {
  var tempUrl = new URL(tabURL);
  var baseDomain = tempUrl.hostname.replace("www.", "");

  return baseDomain;
};

const writeToLog = async function (msg) {
  console.log("WIDIFY: " + msg);
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

  return new Promise((resolve, reject) => {
    try {
      getSetting(url).then((result) => {
        if (result) {
          let obj = checkForExisting(result, key);
          if (obj) {
            let index = result.indexOf(obj);
            result.fill((obj[key] = value), index, index++);
          } else {
            siteOption[key] = value;
            result.push(siteOption);
          }
          siteSetting[url] = result;
        } else {
          siteOption[key] = value;
          siteSetting[url] = [siteOption];
        }
        chrome.storage.local.set(siteSetting, function () {
          resolve();
        });
      });
    } catch (ex) {
      reject(ex);
    }
  });
};

function checkForExisting(result, key) {
  let obj = [];

  for (let index = 0; index < result.length; index++) {
    obj = [result[index]].find((x) => {
      return key in x;
    });
    if (obj) {
      return obj;
    }
  }
}

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
