//this function helps pattern matching links
function patternUrl(url) {
	if (url[url.length - 1] == "/")
		return url.split("://")[1].substring(0, url.split("://")[1].length - 1);
	else
		return url.split("://")[1];
}

function onError(error) {
	console.log(`Error: ${error}`);
}

function handleUpdated(tabId, changeInfo, currentTab) {

	//tabs will be a list containing all opened tabs
	browser.tabs.query({}).then((tabs) => {

		//get enabledLinks from storage
		var loadLinks = browser.storage.sync.get('enLinks');
		loadLinks.then((res) => {
			// enabledLinks = res[Object.keys(res)[0]].split(",")
			enabledLinks = res["enLinks"].split(",")

			var enabledLinksPatterns = [];
			enabledLinks.forEach((x) => {
				enabledLinksPatterns.push(patternUrl(x))
			});

			//just as a page is updated, check if the website belongs to enabledLinks
			let matchedTab = false;
			for (let i = 0; i < enabledLinksPatterns.length; i++) {
				if (currentTab.url.search(enabledLinksPatterns[i]) > 0) {
					matchedTab = currentTab;
					matchedLinkIndex = i;
					break;
				}
			}

			//if the updated page website belongs to enabledLinks 
			if (matchedTab) {

				let movingTab = false;
				for (let tab of tabs) {
					if (tab.url.search(patternUrl(matchedTab.url)) > 0 && tab.id != matchedTab.id) {
						movingTab = tab;
						break;
					}
				}

				//and if the updated website is already present in the opened tabs then switch to the window where the old tab is
				if (movingTab) {
					let updatingWindow = browser.windows.update(movingTab.windowId, {
						focused: true
					});

					updatingWindow.then(() => {
						//and then select the old tab as active
						let updatingTab = browser.tabs.update(movingTab.id, {
							active: true
						});

						//and then close the newly opened website, in the tab that wasn't already opened
						updatingTab.then(() => {
							let removing = browser.tabs.remove(matchedTab.id);
							removing.then(() => {

							})
						});
					});


					//but if the tab wasn't already present in the opened tabs
				} else {

					//then just as soon as it is loading, determine it's new position according to the sorted list algotrithm that follows
					if (Object.keys(changeInfo).includes("status")) {
						if (changeInfo.status = "loading") {


							//mainWindowId is the id of a window which between its tabs matches most of enabledLinksPatterns
							windowsRank = [];

							function addOrIncrease(l, n) {
								for (let i = 0; i < l.length; i++) {
									if (Object.keys(l[i])[0] == n) {
										l[i][n]++;
										return;
									}
								}
								item = {};
								item[n] = 1;
								l.push(item);
							}

							let mainWindowId = currentTab.windowId;
							for (let i = 0; i < tabs.length; i++) {
								for (let k = 0; k < enabledLinksPatterns.length; k++)
									if (tabs[i].url.search(enabledLinksPatterns[k]) > 0) {
										addOrIncrease(windowsRank, tabs[i].windowId);
									}
							}
							windowsRank.sort((a, b) => b[Object.keys(b)[0]] - a[Object.keys(a)[0]]);

							if (windowsRank.length > 0)
								mainWindowId = Number.parseInt(Object.keys(windowsRank[0])[0]);

							//windowTabs are the tabs in the main window
							windowTabs = [];
							for (let i = 0; i < tabs.length; i++)
								if (tabs[i].windowId == mainWindowId)
									windowTabs.push(tabs[i]);

							//the matching algotrithm is:
							//first get the position posOrder that currentTab would virtually occupy if all the enabledLinks were opened
							let posOrder = -1;
							for (let i = 0; i < enabledLinksPatterns.length; i++) {
								if (currentTab.url.search(enabledLinksPatterns[i]) > 0)
									posOrder = i;
							}

							//newPos is the position that currentTab will occupy, given that there are not other matched tabs in a smaller or equal to position to their respective virtual position
							let newPos = 0;
							for (let i = 0; i < windowTabs.length; i++) {

								let tabN = enabledLinksPatterns.length;
								for (let k = 0; k < enabledLinksPatterns.length; k++) {
									if (windowTabs[i].url.search(enabledLinksPatterns[k]) > 0)
										tabN = k;
								}

								if (posOrder > tabN)
									newPos++;
							}

							//focus the main window, move currentTab to the main window and then place it at index newPos, make the currentTab active
							browser.windows.update(mainWindowId, {
								focused: true
							}).then(() => {
								browser.tabs.move(currentTab.id, {
									index: newPos,
									windowId: mainWindowId
								}).then(() => {
									browser.tabs.update(currentTab.id, {
										active: true
									});
								});
							});
						}
					}
				}
			}
		}, () => {});
	});
}

browser.tabs.onUpdated.addListener(handleUpdated);
