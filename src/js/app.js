App = {
	web3Provider: null,
	contracts: {},
	account: '0x0',
	loading: false,
	tokenPrice: 1000000000000000,
	tokenSold: 0,
	tokensAvailable: 750000,

	init: function() {
		console.log('init...');
		return App.initWeb3();
	},
	initWeb3: function() {
		if (typeof web3 !== 'undefined') {
			App.web3Provider = web3.currentProvider;
			web3 = new Web3(web3.currentProvider);
		} else {
			App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
			web3 = new Web3(App.web3Provider);
		}
		return App.initContracts();
	},
	initContracts: function() {
		$.getJSON("QuantumCoinSale.json", function(quantumTokenSale) {
			App.contracts.QuantumCoinSale = TruffleContract(quantumTokenSale);
			App.contracts.QuantumCoinSale.setProvider(App.web3Provider);
			App.contracts.QuantumCoinSale.deployed().then(function(quantumTokenSale) {
				console.log("Quantum Coin Sale Address: ", quantumTokenSale.address);
			})
		}).done(function() {
			$.getJSON("QuantumCoin.json", function(quantumToken) {
				App.contracts.QuantumCoin = TruffleContract(quantumToken);
				App.contracts.QuantumCoin.setProvider(App.web3Provider);
				App.contracts.QuantumCoin.deployed().then(function(quantumToken) {
					console.log("Quantum Coin Address: ", quantumToken.address);
				});
				App.listenForEvents();
				return App.render();
			});
		})
	},
	listenForEvents: function() {
		// events emitted from contracts
		App.contracts.QuantumCoinSale.deployed().then(function(instance) {
			instance.Sell({}, {
				fromBlock: 0,
				toBLock: 'latest'
			}).watch(function(error, event) {
				console.log("event triggered", event);
				App.render();
			})
		});
	},
	render: function() {
		if (App.loading) return;
		App.loading = true;

		let loader = $('#loader');
		let content = $('#content');

		loader.show();
		content.hide();

		// load account data
		web3.eth.getCoinbase(function(err, account) {
			if (err === null) {
				App.account = account;
				$('#accountAddress').html("Your account: " + account);
			}
		})

		App.contracts.QuantumCoinSale.deployed().then(function(instance) {
			quantumTokenSaleInstance = instance;
			return quantumTokenSaleInstance.tokenPrice();
		}).then(function(tokenPrice) {
			App.tokenPrice = tokenPrice;
			$('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
			return quantumTokenSaleInstance.tokenSold();
		}).then(function(tokenSold) {
			App.tokenSold = tokenSold.toNumber();
			$('.tokens-sold').html(App.tokenSold);
			$('.tokens-available').html(App.tokensAvailable);

			let progressPercent = (App.tokenSold / App.tokensAvailable) * 100;
			$('#progress').css("width", progressPercent + "%");

			App.contracts.QuantumCoin.deployed().then(function(instance) {
				quantumTokenInstance = instance;
				return quantumTokenInstance.balanceOf(App.account);
			}).then(function(balance) {
				$('.dapp-balance').html(balance.toNumber());
				App.loading = false;
				loader.hide();
				content.show();
			});
		});
	},
	buyTokens: function() {
		$('#content').hide();
		$('#loader').show();
		let numberOfTokens = $('#numberOfTokens').val();
		App.contracts.QuantumCoinSale.deployed().then(function(instance) {
			return instance.buyTokens(numberOfTokens, {
				from: App.account,
				value: numberOfTokens * App.tokenPrice,
				gas: 500000
			});
		}).then(function(result) {
			console.log("Tokens bought...");
			$('form').trigger('reset');
		});
	}
}

$(function() {
	$(window).load(function() {
		App.init();
		App.initContracts();
	})
});