// SPDX-License-Identifier: MIT
// Creators: Chiru Labs

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import '../ERC721A.sol';

contract ERC721AMock is ERC721A, Ownable {

    // metadata URI
    string private _baseTokenURI;

    constructor(string memory name_, string memory symbol_) ERC721A(name_, symbol_, 10, 10000) {}

    function numberMinted(address addr) public view returns (uint256) {
        return _numberMinted(addr);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function safeMint(address to, uint256 quantity) public {
        _safeMint(to, quantity);
    }

    function safeMint(
        address to,
        uint256 quantity,
        bytes memory _data
    ) public {
        _safeMint(to, quantity, _data);
    }

    function mint(
        address to,
        uint256 quantity,
        bytes memory _data,
        bool safe
    ) public {
        _mint(to, quantity, _data, safe);
    }

    function setBaseURI(string calldata uri) external onlyOwner {
        _baseTokenURI = uri;
    }

}
