// Global variables
var lotteryAddress = '0x1371ae05a449308fe819211ffa68db3efef7c814';
var lotteryContract = null;

var lotteryActive = false;
var lotteryEndingTime = 0;
var ticketPrice = 0;


// Declare web3 library
if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    // web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/v3/ef4aee25daf64b56904871052a066b2b"));
}
// Checking if user already in "no-web3" page.
var inNoWeb3 = window.location.href.indexOf('no-web3') == -1 ? false : true;
var inMetaMaskLocked = window.location.href.indexOf('metamask-locked') == -1 ? false : true;

// Checking if user have existing web3 provider
if (typeof web3 !== 'undefined') {
	web3.eth.defaultAccount = web3.eth.accounts[0];
	
	// Join Smart Contract
	var lotteryABI = $.getJSON("json/lotteryABI.json", function(contactABI) {
		var lotteryContractABI = web3.eth.contract(contactABI);
		window.lotteryContract = lotteryContractABI.at(window.lotteryAddress);
	});

	// Checking is client going with web3 provider in to 'no-web3' page.
	if (inNoWeb3) {
		window.location.href = "/";
	}
} else {
	if (!inNoWeb3) {
		window.location.href = "/no-web3.html";
	}
}

// Website on load processes
jQuery(document).ready(function ($) {
    "use strict";

	// Checking is MetaMask locked
	if (isMetaMaskLocked() && !inMetaMaskLocked) {
		window.location.href = "?metamask-locked";
	} else if (!isMetaMaskLocked() && inMetaMaskLocked) {
		window.location.href = "/";
	}

	// Add information in website from MetaMask
	if (typeof web3 !== 'undefined') {
		setTimeout(function() {
			$('.w_address').html(web3.eth.defaultAccount);
			web3.eth.getBalance(web3.eth.defaultAccount, function(err, resp) {
				var balance = web3.fromWei(resp['c'][0], 'kwei') / 10;
				$('.w_balance').html(balance+' ETH');
			});
		}, 50);
	} else {
		$('.metamask-info').hide();
		$('.w_address, .w_balance').html('Error');
	}

	// Get lottery owner
	window.lotteryContract.owner(function(err, resp) {
		if (!err) {
			if (web3.eth.defaultAccount == resp) {
				$('.owner_menu').show();
			}
		}
	});

	// Update Info
	getAndUpdateInfoFromSC();

	// Etc
	$('#buy_ticket').click(function() {
		alert(window.ticketPrice);
		window.lotteryContract.buyTicket({from: web3.eth.defaultAccount, value: web3.toWei(window.ticketPrice, 'finney')}, function(err, resp) {
			console.error(err);
			console.warn(resp);
		});
	});
});

function getAndUpdateInfoFromSC() {
	// Get lottery status (active or not)
	window.lotteryContract.lotteryEnded(function(err, resp) {
		if (!err) {
			if (!resp) {
				window.lotteryActive = true;
				$('.l_status').html('Active');
			} else {	
				$('.l_status').html('Inactive');
			}
		} else {	
			$('.l_status').html('Error');
		}
	});

	// Get lottery ending time
	window.lotteryContract.endingTime(function(err, resp) {
		if (!err) {
			window.lotteryEndingTime = resp['c'][0];
			$('.l_ending_time').html(timeConverter(window.lotteryEndingTime));
		} else {
			$('.l_ending_time').html('Error');
		}
	});

	// Get ticket price
	window.lotteryContract.ticketPrice(function(err, resp) {
		if (!err) {
			window.ticketPrice = resp['c'][0];
			$('.l_price').html(web3.fromWei(web3.toWei(resp['c'][0], 'finney'), 'ether')+' ETH');
		} else {
			$('.l_price').html('Error');
		}		
	});

	// Get tickets amount
	window.lotteryContract.ticketAmount(function(err, resp) {
		if (!err) {
			$('.l_amount').html(resp['c'][0]);
		} else {
			$('.l_amount').html('Error');
		}		
	});

	// Get max tickets per person
	window.lotteryContract.ticketsPerPerson(function(err, resp) {
		if (!err) {
			$('.l_tickets_per_person').html(resp['c'][0]);
		} else {
			$('.l_tickets_per_person').html('Error');
		}		
	});

	// Get sold tickets
	window.lotteryContract.ticketsSold(function(err, resp) {
		if (!err) {
			$('.l_sold').html(resp['c'][0]);
		} else {
			$('.l_sold').html('Error');
		}		
	});

	// Get unique owners
	window.lotteryContract.uniqueOwners(function(err, resp) {
		if (!err) {
			$('.l_unique_owners').html(resp['c'][0]);
		} else {
			$('.l_unique_owners').html('Error');
		}		
	});

	// Get fee
	window.lotteryContract.fee(function(err, resp) {
		if (!err) {
			var ticketFee = web3.fromWei(web3.toWei(resp['c'][0], 'finney'), 'ether');
			$('.l_fee').html(ticketFee+' ETH');
		} else {
			$('.l_fee').html('Error');
		}		
	});
}

function isMetaMaskLocked() {
    var isLocked = undefined;
    if (typeof web3 !== 'undefined') {
        web3.eth.getAccounts(function (err, accounts) { 
            isLocked = accounts[0];
            if (isLocked == undefined) return true;
        });
    }
    return false;        
}

function timeConverter(UNIX_timestamp) {
	var a = new Date(UNIX_timestamp * 1000);
	var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	var year = a.getFullYear();
	var month = months[a.getMonth()];
	var date = a.getDate();
	var hour = a.getHours();
	var min = a.getMinutes();
	var sec = a.getSeconds();

	if (hour < 10) 	hour = '0'+hour;
	if (min < 10) 	min = '0'+min;
	if (sec < 10) 	sec = '0'+sec;

	var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
	return time;
}