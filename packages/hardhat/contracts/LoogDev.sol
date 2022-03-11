// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./LoogBase.sol";

error AllDevTokensClaimed();

abstract contract LoogDev is Ownable, LoogBase {

  uint256 public immutable devTokens;
  uint256 public devTokensClaimed;

  constructor(
    uint256 devTokens_
  ) {
    devTokens = devTokens_;
  }

  // For marketing etc.
  function devMint(address addr, uint256 quantity) external onlyOwner {
    // console.log("totalSupply()=%s", totalSupply());
    if (totalSupply() + quantity > collectionSize) revert SoldOut();
    if (devTokensClaimed + quantity > devTokens) revert AllDevTokensClaimed();
    if (quantity > maxBatchSize) revert TooMany();

    devTokensClaimed += quantity;
    _safeMint(addr, quantity);
  }

}
