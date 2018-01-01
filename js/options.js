window.onload = function() {
	loadCryptocurrencyList();
	loadCurrencyList();
	document.getElementById('saveCrypto').addEventListener('click', function() { save_options('crypto') });
	document.getElementById('saveCurrency').addEventListener('click', function() { save_options('currency') });
	document.getElementById('saveNotif').addEventListener('click', function() { save_options('notifications') });
	document.getElementById('cryptoTab').addEventListener('click', function() { openOptions(event, 'crypto') });
	document.getElementById('currencyTab').addEventListener('click', function() { openOptions(event, 'currency') });
	document.getElementById('notifTab').addEventListener('click', function() { openOptions(event, 'notifications') });
	document.getElementById('enablePriceUpdates').addEventListener('click', function() { enablePriceUpdates() });
}

function loadCryptocurrencyList() {
	var xcurrencies = new XMLHttpRequest();
	xcurrencies.open('GET', 'https://www.cryptocompare.com/api/data/coinlist/', true);
	xcurrencies.onreadystatechange = function() {
		if(xcurrencies.readyState == 4) {
			var response = JSON.parse(xcurrencies.responseText);
			var data = response.Data;
			currencies = document.getElementById('cryptocurrencies');
			for(var key in data) {
				var coin = data[key];
				var option = document.createElement('input');
				option.type = 'checkbox';
				option.id = coin.Symbol;
				option.value = coin.Symbol;
				var label = document.createElement('label');
				label.setAttribute('for', coin.Symbol);
				label.innerHTML = coin.CoinName;
				currencies.appendChild(document.createElement('br'));
				currencies.appendChild(option);			
				currencies.appendChild(label);
				currencies.appendChild(document.createElement('br'));
			}
			restore_options('crypto')
		}
	};
	xcurrencies.send();
}

function loadCurrencyList() {
	var select = document.getElementById('currencyList');
    var file = new XMLHttpRequest();
    file.open("GET", 'data/currencies.txt', false);
    file.onreadystatechange = function () {
        if(file.readyState === 4) {
            if(file.status === 200 || file.status == 0) {
                var allText = file.responseText;
                var lines = allText.split('\n');
                for(i = 0; i < lines.length; i++) {
                	var currency = lines[i].split(',');
                	var option = document.createElement('option');
                	option.value = currency[0];
                	option.text = currency[1] + '(' + currency[0] + ')';
                	select.appendChild(option);
                }
            }
        }
    }
    file.send(null);
}

// Saves options to chrome.storage.sync.
function save_options(optionName) {
	var status;
	if(optionName == 'crypto') {
		var coins = [];
		var i = 0;
		$('input:checkbox:checked').map(function() {
			coins[i] = {};
			coins[i].symbol = this.value;
			coins[i].name = $("#"+ this.value).next("label").html();
			i++;
	    	return this.value;
		}).get();
		if(coins.length == 0) {
			alert("Select at least 1 crytpocurrency.");
			return;
		}
		console.log(coins)
	  	chrome.storage.sync.set({
	    	coins: coins
	  	}, function() {
	  		status = document.getElementById('cryptoStatus');
	    	set_status(status);
	  });
	}
	else if(optionName == 'currency') {
		chrome.storage.sync.set({
	    	currency: document.getElementById('currencyList').value
	  	}, function() {
	  		status = document.getElementById('currencyStatus');
	    	set_status(status);
		});
	}
	else if(optionName == 'notifications') {
		var enablePriceUpdates = document.getElementById('enablePriceUpdates').checked
		var updateInterval = [];
		if(enablePriceUpdates) {
			updateInterval[0] = document.getElementById('updateIntervalHours').value
			updateInterval[1] = document.getElementById('updateIntervalMins').value
			if(updateInterval[0] == 0 && updateInterval[1] == 0) {
				alert('Select update time interval greater than 0.');
				return;
			}
			mins = parseInt(updateInterval[0] * 60) + parseInt(updateInterval[1]);
		}
		chrome.storage.sync.set({
			enablePriceUpdates: enablePriceUpdates,
	    	updateInterval: updateInterval
	  	}, function() {
	  		status = document.getElementById('notifStatus');
	    	set_status(status);
	    	if(enablePriceUpdates) {
				chrome.alarms.create("notification_delay", {
					"delayInMinutes": mins,
					"periodInMinutes": mins
				})	    	}
	    	else {
	    		chrome.alarms.clear('notification_delay');
	    	}
		});
	}
}

// Update status to let user know options were saved
function set_status(status) {
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 2000);
}

// Restores checkbox state using the preferences stored in chrome.storage.
function restore_options(optionName) {
	if(optionName == 'crypto') { 
		chrome.storage.sync.get('coins', function(items) {
			if(items.coins != null) { 
				for(var i = 0; i < items.coins.length; i++) {
					document.getElementById(items.coins[i].symbol).checked = true
			    }
			}
		});
	}
	else if(optionName == 'currency') {
		chrome.storage.sync.get('currency', function(items) {
			document.getElementById('currencyList').value = items.currency
		});
	}
	else if(optionName == 'notifications') {
		chrome.storage.sync.get('enablePriceUpdates', function(value) {
			if(value.enablePriceUpdates) {
				chrome.storage.sync.get('updateInterval', function(items) {
					document.getElementById('enablePriceUpdates').checked = true
					document.getElementById('updateIntervalHours').value = items.updateInterval[0];
					document.getElementById('updateIntervalMins').value = items.updateInterval[1];
				});
			}
			else {
				document.getElementById('updateIntervalHours').value = 0;
				document.getElementById('updateIntervalMins').value = 0;
				document.getElementById('updateIntervalHours').disabled = true;
				document.getElementById('updateIntervalMins').disabled = true;
			}
		});
	}
}

// Switching tabs
function openOptions(evt, optionName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(optionName).style.display = "block";
    evt.currentTarget.className += " active";

    // Restore previously selected options
    restore_options(optionName)
}

function enablePriceUpdates() {
	var checkbox = document.getElementById('enablePriceUpdates');
	if(checkbox.checked) {
		document.getElementById('updateIntervalHours').disabled = false;
		document.getElementById('updateIntervalMins').disabled = false;
		document.getElementById('priceUpdates').style.color = 'black';
	}
	else {
		document.getElementById('updateIntervalHours').disabled = true;
		document.getElementById('updateIntervalMins').disabled = true;
		document.getElementById('priceUpdates').style.color = 'grey';
	}
}

// Load default settings when extension is installed
function loadDefaultSettings() {
	// Selecting Bitcoin by default under cryptocurrencies
	var coins = [];
	coins[0] = {};
	coins[0].symbol = 'BTC';
	coins[0].name = 'Bitcoin';
	// Setting default currency to USD
	var currency = 'USD';
	// Enabling price updates & setting interval to 1 hour
	var enablePriceUpdates = true;
	var updateInterval = [];
	updateInterval[0] = 1;
	updateInterval[1] = 0;
	chrome.storage.sync.set({
	    	coins: coins,
	    	currency: currency,
	    	enablePriceUpdates: enablePriceUpdates,
	    	updateInterval: updateInterval
	}, function() {});
}