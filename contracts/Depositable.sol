pragma solidity ^0.5.8;

// Handy: https://ethereum.stackexchange.com/a/43768
contract Depositable {
    mapping(address => uint256) balances;

    function getOnesBalance(address addr) public view returns (uint){
        return balances[addr];
    }
    function getMyBalance() public view returns (uint){
        return balances[msg.sender];
    }
    function getContractBalance() public view returns (uint){
        return address(this).balance;
    }
    function getContractAddress() public view returns (address){
        return address(this);
    }
    function deposit() public payable {balances[msg.sender]+=msg.value;}
    function() external payable {deposit();}
}
