// Load default settings when extension is installed
chrome.runtime.onInstalled.addListener(function(details) {
	if(details.reason == 'install') {
		loadDefaultSettings();
		chrome.runtime.openOptionsPage();
	}
});

var mins;
chrome.storage.sync.get('enablePriceUpdates', function(value) {
	if(value.enablePriceUpdates) {
		chrome.storage.sync.get('updateInterval', function(items) {
			mins = parseInt(items.updateInterval[0] * 60) + parseInt(items.updateInterval[1]);
			chrome.alarms.create("notification_delay", {
				"delayInMinutes": mins,
				"periodInMinutes": mins
			})
		});
	}
});

chrome.alarms.onAlarm.addListener(function(e) {
	if(e.name == "notification_delay") {
		displayPrices('notifications');
	}
});