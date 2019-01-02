// Global variables
var lotteryAddress = '0xc20dffbcabb0eab056f5771d8ef71ca1d25e4341';
var myPrivateKey = 'my_private_key';
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
	web3.eth.defaultAccount = web3.currentProvider.selectedAddress;
	
	// Join Smart Contract
	var lotteryABI = $.getJSON("json/lotteryABI.json", function(contactABI) {
		window.lotteryContract = new web3.eth.Contract(contactABI, window.lotteryAddress);
		// window.lotteryContract = lotteryContractABI.at(window.lotteryAddress);
	});

	// Checking is client going with web3 provider in to 'no-web3' page.
	if (inNoWeb3) {
		window.location.href = "/";
	}
} else {
	if (!inNoWeb3) {
		window.location.href = "no-web3.html";
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
			$('.w_address').html(web3.currentProvider.selectedAddress);
			web3.eth.getBalance(web3.currentProvider.selectedAddress, function(err, resp) {
				var balance = web3.utils.fromWei(resp, 'ether');;
				$('.w_balance').html(balance+' ETH');
			});
		}, 50);
	} else {
		$('.metamask-info').hide();
		$('.w_address, .w_balance').html('Error');
	}

	// Get lottery owner
	window.lotteryContract.methods.owner().call().then(function (response) {
		if (response) {
			if (web3.currentProvider.selectedAddress.toLowerCase() == response.toLowerCase()) {
				$('.owner_menu').show();
			}
		}
	});

	// Update Info
	getAndUpdateInfoFromSC();

	// Etc
	$('#buy_ticket').click(function() {
		window.lotteryContract.methods.buyTicket().send({from: web3.currentProvider.selectedAddress, value: window.ticketPrice}, function(err, resp) {
			console.error(err);
			console.warn(resp);
		})
		.on('transactionHash', function (hash) {
			alert('Please wait, you will get your ticket soon!');
		})
		.on('receipt', function (receipt) {
			alert('Your ticket arrived!');
			getAndUpdateInfoFromSC();
		});
	});

	if ($('#test_signed').length) {
		$('#test_signed').click(function () {

			var jx = window.lotteryContract.methods.buyTicket().encodeABI();
			console.log('JX:');
			console.log(jx);
			web3.eth.accounts.signTransaction({to: window.lotteryAddress, gas: 2000000, data: jx, value: window.ticketPrice}, window.myPrivateKey).then(function(response) {
				console.log(response);

				web3.eth.sendSignedTransaction(response.rawTransaction).on('receipt', console.log);
			});

		});
	}
});

function getAndUpdateInfoFromSC() {
	// Get lottery status (active or not)
	window.lotteryContract.methods.lotteryEnded().call().then(function (response) {
		if (!response) {
			window.lotteryActive = true;
			$('.l_status').html('Active');
		} else {	
			$('.l_status').html('Inactive');
		}
	});

	// Get lottery ending time
	window.lotteryContract.methods.endingTime().call().then(function (response) {
		window.lotteryEndingTime = response;
		$('.l_ending_time').html(timeConverter(window.lotteryEndingTime));
	});

	// Get ticket price
	window.lotteryContract.methods.ticketPrice().call().then(function (response) {
		window.ticketPrice = response;
		$('.l_price').html(web3.utils.fromWei(window.ticketPrice, 'ether')+' ETH');
	});

	// Get tickets amount
	window.lotteryContract.methods.ticketAmount().call().then(function (response) {
		$('.l_amount').html(response);
	});

	// Get max tickets per person
	window.lotteryContract.methods.ticketsPerPerson().call().then(function (response) {
		$('.l_tickets_per_person').html(response);
	});

	// Get sold tickets
	window.lotteryContract.methods.ticketsSold().call().then(function (response) {
		$('.l_sold').html(response);
	});

	// Get unique owners
	window.lotteryContract.methods.uniqueOwners().call().then(function (response) {
		$('.l_unique_owners').html(response);
	});

	// Get fee
	window.lotteryContract.methods.fee().call().then(function (response) {
		$('.l_fee').html(response+'%');
	});

	// Get your tickets
	window.lotteryContract.methods.ownerTicketCount(web3.currentProvider.selectedAddress).call().then(function (response) {
		$('.y_tickets').html(response);
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