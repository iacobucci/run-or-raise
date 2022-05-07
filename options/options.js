function saveOptions(e) {
  browser.storage.sync.set({
    enLinks: document.querySelector("#enLinks").value
  });
  e.preventDefault();
}

function restoreOptions() {
  var gettingItem = browser.storage.sync.get('enLinks');
  gettingItem.then((res) => {
    document.querySelector("#enLinks").value = res.enLinks || 'https://open.spotify.com,https://web.whatsapp.com,https://web.telegram.org';
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
