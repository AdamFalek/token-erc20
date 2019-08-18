let QuantumCoin = artifacts.require('./QuantumCoin.sol');

contract('QuantumCoin', function(accounts) {
	it('sets the total supply upon deployment', function() {
		return QuantumCoin.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.totalSupply();
		}).then(function(totalSupply) {
			assert.equal(totalSupply.toNumber(), 1000000, 'sets the total supply to 1.000.000');
		});
	});

	it('approves tokens for delegated transfer', function() {
	   	return QuantumCoin.deployed().then(function(instance) {
	    	tokenInstance = instance;
	    	return tokenInstance.approve.call(accounts[1], 100);
	    }).then(function(success) {
	    	assert.equal(success, true, 'it returns true');
	    	return tokenInstance.approve(accounts[1], 100, { from: accounts[0] });
	    }).then(function(receipt) {
			assert.equal(receipt.logs.length, 1, 'triggers one event');
			assert.equal(receipt.logs[0].event, 'Approval', 'should be the "Approval" event');
			assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the account the tokens are authorized by');
			assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs the account the tokens are authorized to');
			assert.equal(receipt.logs[0].args._value, 100, 'logs the transfer amount');
			return tokenInstance.allowance(accounts[0], accounts[1]);
	    }).then(function(allowance) {
	    	assert.equal(allowance.toNumber(), 100, 'stores the allowance for delegated trasnfer');
	    });
	});
})