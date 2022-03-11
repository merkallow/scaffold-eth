// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "hardhat/console.sol";
import 'base64-sol/base64.sol';
import './lib/HexStrings.sol';
import './lib/ToColor.sol';

import "./LoogBase.sol";

// Thanks scaffold-eth!
abstract contract LoogTokenURI is LoogBase {
  using Strings for uint256;
  using HexStrings for uint160;
  using ToColor for bytes3;

  /**
   * @dev See {IERC721Metadata-tokenURI}.
   */
  function loogTokenURI(uint256 id)
    internal
    view
    returns (string memory)
  {
    require(
      _exists(id),
      "ERC721Metadata: URI query for nonexistent token"
    );

      bytes memory json = makeJson(id);

      // return string(json);
      return
          string(
              abi.encodePacked(
                'data:application/json;base64,',
                Base64.encode(json)
              )
          );
  }

  function makeJson(uint256 id) internal view returns (bytes memory) {

    bytes32 rand = randFromId(id);
    string memory color = randToColor(rand).toColor();
    string memory chubbiness = uint2str(randToChubbiness(rand));

    bytes memory result;
    result = abi.encodePacked('{');
    result = abi.encodePacked(result,'"name":"',string(abi.encodePacked('Loogie #',id.toString())),'",');
    result = abi.encodePacked(result,'"description":"',string(abi.encodePacked('This Loogie is the color #',color,' with a chubbiness of ',chubbiness,'!!!')),'",');
    result = abi.encodePacked(result,'"owner":"',(uint160(ownerOf(id))).toHexString(20),'",');
    result = abi.encodePacked(result,'"external_url":"https://www.merkallow.com",');
    result = abi.encodePacked(result,'"attributes":[');
    result = abi.encodePacked(result,'{"trait_type":"color",');
    result = abi.encodePacked(result,'"value":"#',color,'"}');
    result = abi.encodePacked(result,',');
    result = abi.encodePacked(result,'{"trait_type":"chubbiness",');
    result = abi.encodePacked(result,'"value":',chubbiness,'}');
    result = abi.encodePacked(result,'],');
    result = abi.encodePacked(result,'"image":"data:image/svg+xml;base64,',Base64.encode(bytes(generateSVGofTokenById(id))),'"');
    result = abi.encodePacked(result,'}');

    return result;
  }

  function randFromId(uint256 id) internal view returns (bytes32) {
    return keccak256(abi.encodePacked( address(this), id ));
  }

  function randToColor(bytes32 rand) internal pure returns (bytes3) {
    return bytes2(rand[0]) | ( bytes2(rand[1]) >> 8 ) | ( bytes3(rand[2]) >> 16 );
  }

  function randToChubbiness(bytes32 rand) internal pure returns (uint256) {
    return 35+((55*uint256(uint8(rand[3])))/255);
  }

  function generateSVGofTokenById(uint256 id) internal view returns (string memory) {

    string memory svg = string(abi.encodePacked(
      '<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">',
        renderTokenById(id),
      '</svg>'
    ));

    return svg;
  }

  // Visibility is `public` to enable it being called by other contracts for composition.
  function renderTokenById(uint256 id) public view returns (string memory) {
    bytes32 rand = randFromId(id);
    return string(abi.encodePacked(
      '<g id="eye1">',
          '<ellipse stroke-width="3" ry="29.5" rx="29.5" id="svg_1" cy="154.5" cx="181.5" stroke="#000" fill="#fff"/>',
          '<ellipse ry="3.5" rx="2.5" id="svg_3" cy="154.5" cx="173.5" stroke-width="3" stroke="#000" fill="#000000"/>',
        '</g>',
        '<g id="head">',
          '<ellipse fill="#',
          randToColor(rand).toColor(),
          '" stroke-width="3" cx="204.5" cy="211.80065" id="svg_5" rx="',
          randToChubbiness(rand).toString(),
          '" ry="51.80065" stroke="#000"/>',
        '</g>',
        '<g id="eye2">',
          '<ellipse stroke-width="3" ry="29.5" rx="29.5" id="svg_2" cy="168.5" cx="209.5" stroke="#000" fill="#fff"/>',
          '<ellipse ry="3.5" rx="3" id="svg_4" cy="169.5" cx="208" stroke-width="3" fill="#000000" stroke="#000"/>',
        '</g>'
      ));
  }

  function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
      if (_i == 0) {
          return "0";
      }
      uint j = _i;
      uint len;
      while (j != 0) {
          len++;
          j /= 10;
      }
      bytes memory bstr = new bytes(len);
      uint k = len;
      while (_i != 0) {
          k = k-1;
          uint8 temp = (48 + uint8(_i - _i / 10 * 10));
          bytes1 b1 = bytes1(temp);
          bstr[k] = b1;
          _i /= 10;
      }
      return string(bstr);
  }
}
