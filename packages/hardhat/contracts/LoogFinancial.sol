// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./LoogBase.sol";

error TransferFailed();

abstract contract LoogFinancial is Ownable, ReentrancyGuard {

  function withdrawMoney() external onlyOwner nonReentrant {
    uint256 balance = address(this).balance;
    Address.sendValue(payable(msg.sender), balance);
  }

}
