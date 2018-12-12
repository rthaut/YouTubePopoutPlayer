function saveOptions(e) {
  e.preventDefault();
  browser.storage.sync.set({
    width: document.querySelector("#width").value
    height: document.querySelector("#height").value
  });
}

function restoreOptions() {

  function setCurrentChoice(result) {
    document.querySelector("#width").value = result.width;
    document.querySelector("#height").value = result.height;
  }

  browser.storage.sync.get({
    width: 854,
    height: 480
  }, setCurrentChoice);

}
document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
