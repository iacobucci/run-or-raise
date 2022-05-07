function saveOptions(e) {
	browser.storage.sync.set({
		links: document.querySelector("#user_selectable").value
	});
	e.preventDefault();

	var storageItem = browser.storage.managed.get('links');
	storageItem.then((res) => {
		alert(res);
	});

}

function restoreOptions() {
	var storageItem = browser.storage.managed.get('links');
	storageItem.then((res) => {
		document.querySelector("#managed-links").innerText = res.links;
	});

	var gettingItem = browser.storage.sync.get('links');
	gettingItem.then((res) => {
		document.querySelector("#user_selectable").value = res.links || "['https://open.spotify.com', 'https://keep.google.com/', 'https://web.whatsapp.com/', 'https://web.telegram.org']";
	});
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
