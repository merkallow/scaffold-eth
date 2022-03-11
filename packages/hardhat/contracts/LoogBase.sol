// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./ERC721A.sol";

error IllegalCallByContract();
error NotEnoughEth();
error SoldOut();
error TooMany();

/**
LoogBase is the base contract that extends ERC721A. It contains a few common errors
and functions used by other contracts. This contract should be as small as possible and
only contain functions used by multiple middle-tier contracts.
 */
abstract contract LoogBase is ERC721A {

  modifier callerIsUser() {
    if (tx.origin != msg.sender) revert IllegalCallByContract();
    _;
  }
  
  function refundIfOver(uint256 price) internal {
    if (msg.value < price) revert NotEnoughEth();
    if (msg.value > price) {
      payable(msg.sender).transfer(msg.value - price);
    }
  }

}
