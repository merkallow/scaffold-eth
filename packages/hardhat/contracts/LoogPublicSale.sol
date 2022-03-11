// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./LoogBase.sol";

error PublicSaleKeyError();
error PublicSaleNotOngoing();
error PublicSaleTooMany();

abstract contract LoogPublicSale is Ownable, LoogBase {

  uint256 public _publicSaleStartTime;
  uint256 public _publicSalePrice;
  uint256 public _publicSaleKey;

  function setupPublicSale(
    uint256 publicSalePrice_,
    uint256 publicSaleStartTime_,
    uint256 publicSaleKey_
  ) external onlyOwner {
    _publicSalePrice = publicSalePrice_;
    _publicSaleStartTime = publicSaleStartTime_;
    _publicSaleKey = publicSaleKey_;
  }

function mintPublicSale(uint256 quantity, uint256 callerPublicSaleKey)
    external
    payable
    callerIsUser
  {

    if (
      _publicSalePrice == 0 ||
      _publicSaleKey == 0 ||
      block.timestamp < _publicSaleStartTime
    ) revert PublicSaleNotOngoing();

    if (_publicSaleKey != callerPublicSaleKey) revert PublicSaleKeyError();
    if (quantity > maxBatchSize) revert PublicSaleTooMany();
    if (totalSupply() + quantity > collectionSize) revert SoldOut();
    if (_numberMinted(msg.sender) + quantity > maxBatchSize) revert TooMany();

    _safeMint(msg.sender, quantity);
    refundIfOver(_publicSalePrice * quantity);
  }

}
