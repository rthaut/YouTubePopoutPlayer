function saveOptions(e) {
  e.preventDefault();
  browser.storage.sync.set({
    width: document.querySelector("#width").value,
    height: document.querySelector("#height").value
  });
}

function restoreOptions() {

  function setCurrentChoice(result) {
    document.querySelector("#width").value = result.width;
    document.querySelector("#height").value = result.height;
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  //TODO get this to work with Config.class.js
  var getting = browser.storage.sync.get({
    width: 854,
    height: 480
  });
  getting.then(setCurrentChoice, onError);

}
document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
