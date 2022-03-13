// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "./LoogBase.sol";

error AllowListAccessRequired();
error AllowListAddressSoldOut();
error AllowListNotStarted();
error AllowListSeedError();


abstract contract LoogAllowList is Ownable, LoogBase {

  uint256 private constant ALLOW_LIST_MAX_MINT = 1;

  uint256 public _allowListPrice;
  bytes32 private _allowListRoot;
  string public _allowListCid;

  mapping(address => uint256) private _allowListClaimed;

  function mintAllowList(uint256 quantity, bytes32[] calldata proof)
    external
    payable
    callerIsUser
  {
    if (_allowListPrice==0) revert AllowListNotStarted();
    if (totalSupply() + quantity > collectionSize) revert SoldOut();
    if (
      !MerkleProof.verify(
        proof, 
        _allowListRoot, 
        keccak256(abi.encodePacked(msg.sender))
      )
    ) revert AllowListAccessRequired();
    if (_allowListClaimed[msg.sender] + quantity> ALLOW_LIST_MAX_MINT) revert AllowListAddressSoldOut();

    _allowListClaimed[msg.sender] = _allowListClaimed[msg.sender] + quantity;

    _safeMint(msg.sender, quantity);
    refundIfOver(_allowListPrice * quantity);
  }

  function enableAllowList(uint256 allowListPrice_, bytes32 allowListRoot_, string memory allowListCid_) public onlyOwner {
    _allowListPrice = allowListPrice_;
    _allowListRoot = allowListRoot_;
    _allowListCid = allowListCid_;
  }

}
