document.querySelectorAll("*").forEach(function (node) {
  var styles = window.getComputedStyle(node, null);

  if (styles.getPropertyValue("max-width") != "none") {
    node.style.setProperty("max-width", "none", "important");
  }
});
