displayPrices('popup');

// displayedIn - popup (default), notifications
function displayPrices(displayedIn) {
	chrome.storage.sync.get(['coins', 'currency'], function(items) {

		// Constructing request paramter - List of coin symbols
		var coinsParam = '';
		// Constructing map of coin symbol & name
		var coinMap = new Object();

		if(items.coins != null) { 
		for(var i = 0; i < items.coins.length; i++) {
			coinsParam += items.coins[i].symbol;
			if(i != items.coins.length - 1) {
				coinsParam += ',';
			}
			coinMap[items.coins[i].symbol] = items.coins[i].name;
	    }

	    var currency = items.currency;
		var request = new XMLHttpRequest();
		request.open('GET', 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=' + coinsParam + '&tsyms=' + currency, true);
		request.send();
		request.onreadystatechange = function() {
			if(request.readyState == 4) {
				var response = JSON.parse(request.responseText);
				if(displayedIn === 'notifications') {
					setNotificationContent(response, coinMap, currency);
				}
				else {

					setPopupContent(response, coinMap, currency)
				}


			}
		};
		}
	});	
}

function setPopupContent(response, coinMap, currency) {
	console.log(currency)
    var table = document.getElementById('cryptoTable');
    var tbdy = document.createElement('tbody');
    console.log(response)
    for (var coin in response) {
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        td.appendChild(document.createTextNode(coinMap[coin]))
        tr.appendChild(td)
        var td = document.createElement('td');
        console.log(response[coin].currency)
        var crypto = response[coin]
        td.appendChild(document.createTextNode(crypto[currency] + ' ' + currency))
        tr.appendChild(td)
        tbdy.appendChild(tr);
    }
    table.appendChild(tbdy);
}

function setNotificationContent(response, coinMap, currency) {
	console.log('setNotificationContent')
	/*var items = [];
	var i = 0;
	for(var coin in response) {
		items[i] = {};
		items[i].title = coinMap[coin];
		items[i].message = response[coin].USD;
		i++;
	}
	*/
	var currentPrices = '';
	for(var coin in response) {
		currentPrices += coinMap[coin];
		currentPrices += ': ';
		var crypto = response[coin]
		currentPrices += crypto[currency] + ' ' + currency;
		currentPrices += '\n';
	}
	chrome.notifications.create(
		{
			type: 'basic',
			title: 'Crypto Alert',
			message: currentPrices,
			iconUrl: 'data/icon.png'
		},
		function(e) {}
	)
}