const QuantumCoin = artifacts.require("./QuantumCoin.sol");
const QuantumCoinSale = artifacts.require("./QuantumCoinSale.sol");

module.exports = function(deployer) {
  deployer.deploy(QuantumCoin, 1000000000000000).then(function() {
  	return deployer.deploy(QuantumCoinSale, QuantumCoin.address);
  });
};
