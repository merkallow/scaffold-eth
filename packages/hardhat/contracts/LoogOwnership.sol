// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./LoogBase.sol";

abstract contract LoogOwnership is Ownable, ReentrancyGuard, LoogBase {

  // Azuki never called it https://bloxy.info/address/0xed5af388653567af2f388e6224dc7c4b3241c544
  function setOwnersExplicit(uint256 quantity) external onlyOwner nonReentrant {
    _setOwnersExplicit(quantity);
  }

  function getOwnershipData(uint256 tokenId)
    external
    view
    returns (TokenOwnership memory)
  {
    return ownershipOf(tokenId);
  }
}
