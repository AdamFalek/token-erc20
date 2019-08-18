pragma solidity ^0.5.8;

import "./QuantumCoin.sol";

contract QuantumCoinSale {
	address admin; // contract deployer
	QuantumCoin public tokenContract;
	uint public tokenPrice;
	uint public tokenSold;

	event Sell(address _buyer, uint _amount);

	constructor(QuantumCoin _tokenContract, uint _tokenPrice) public {
		admin = msg.sender;
		tokenContract = _tokenContract;
		tokenPrice = _tokenPrice;
	}

	function multiply(uint a, uint b) internal pure returns(uint c) {
		require(b == 0 || (c = a * b) / b == c);
	}

	function buyTokens(uint _numberOfTokens) public payable {
		require(msg.value == multiply(_numberOfTokens, tokenPrice));
		require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
		require(tokenContract.transfer(msg.sender, _numberOfTokens));
		tokenSold += _numberOfTokens;

		emit Sell(msg.sender, _numberOfTokens);
	}

	function endSale() public {
		require(msg.sender == admin);
		require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));
	}
}
