export function getBaseDomain(tabURL) {
  var tempUrl = new URL(tabURL);
  var baseDomain = tempUrl.hostname.replace("www.", "");

  return baseDomain;
}

export function writeLog(msg) {
  console.log("Widify: " + msg);
}

export function saveSetting(url, value) {
  const storage = chrome.storage.local;
  var obj = {};
  obj[url] = value;
  storage.set(obj);
}
