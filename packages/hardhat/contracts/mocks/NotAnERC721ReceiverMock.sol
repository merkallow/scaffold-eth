// SPDX-License-Identifier: MIT
// Creators: Chiru Labs

pragma solidity ^0.8.4;

contract NotAnERC721ReceiverMock {

    bytes4 private immutable _retval;

    constructor(bytes4 retval) {
        _retval = retval;
    }

}
