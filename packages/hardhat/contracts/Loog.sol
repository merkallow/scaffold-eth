// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./LoogAllowList.sol";
import "./LoogDev.sol";
import "./LoogFinancial.sol";
import "./LoogOwnership.sol";
import "./LoogPublicSale.sol";
import "./LoogTokenURI.sol";
import "./ERC721A.sol";

/**
This is the "top level" contract. It initializes each of its components in the constructor. It also contains
all of the public interfaces to the ERC721A contract that needs them.
 */
contract Loog is LoogAllowList, LoogDev, LoogFinancial, LoogOwnership, LoogPublicSale, LoogTokenURI {

  constructor(
    uint256 maxBatchSize_,
    uint256 collectionSize_,
    uint256 devTokens_
  ) 
  LoogDev(devTokens_)
  ERC721A("Loog", "LOOG", maxBatchSize_, collectionSize_)
  {
  }

  /**
   * @dev See {IERC721Metadata-tokenURI}.
   */
  function tokenURI(uint256 tokenId)
    public
    view
    virtual
    override
    returns (string memory)
  {
    require(
      _exists(tokenId),
      "ERC721Metadata: URI query for nonexistent token"
    );

    return loogTokenURI(tokenId);

  }

}
