import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import { Alert, Button, Card, Col, Input, List, Menu, Row } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
function Home({ address, yourLocalBalance, readContracts }) {
  // you can also use hooks locally in your component of choice
  // in this case, let's keep track of 'purpose' variable from our contract
  const _allowListCid = useContractReader(readContracts, "Loog", "_allowListCid");
  const [minting, setMinting] = useState(false);
  const coder = new ethers.utils.AbiCoder();

  console.log(` 🍾 _allowListCid=${_allowListCid}`);

  const mintItem = async () => {
    console.log(` 🍾 Mint NFT for address=${address}`);
    const hashedAddress = keccak256(address).toString("hex");
    console.log(` 🍾 hashedAddress=${hashedAddress}`);
    // console.log(` 🍾 keccak256(address)=${keccak256(coder.encode(["address"], [address])).toString("hex")}`);

    const url = `https://${_allowListCid}.ipfs.nftstorage.link/`;

    const response = await fetch(url);
    const serializedMerkle = await response.json();

    console.log(` 🍾 serializedMerkle=`);
    console.log(serializedMerkle);

    const tree = new MerkleTree(serializedMerkle.address_hash, keccak256, { sortPairs: true });

    console.log(` 🍾 serializedMerkle.root=${serializedMerkle.root}`);
    console.log(` 🍾 tree.root            =${tree.getRoot().toString("hex")}`);
    console.log("MerkleTree\n", tree.toString());

    const proof = tree.getHexProof(keccak256(address));

    console.log(` 🍾 proof=${proof}`);

    // upload to ipfs
    // const uploaded = await ipfs.add(JSON.stringify(json[count]));
    // setCount(count + 1);
    // console.log("Uploaded Hash: ", uploaded);
    // const result = tx(
    //   writeContracts &&
    //     writeContracts.YourCollectible &&
    //     writeContracts.YourCollectible.mintItem(address, uploaded.path),
    //   update => {
    //     console.log("📡 Transaction Update:", update);
    //     if (update && (update.status === "confirmed" || update.status === 1)) {
    //       console.log(" 🍾 Transaction " + update.hash + " finished!");
    //       console.log(
    //         " ⛽️ " +
    //           update.gasUsed +
    //           "/" +
    //           (update.gasLimit || update.gas) +
    //           " @ " +
    //           parseFloat(update.gasPrice) / 1000000000 +
    //           " gwei",
    //       );
    //     }
    //   },
    // );
  };

  return (
    <div>
      <div style={{ width: 640, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
        <Button
          // disabled={minting}
          shape="round"
          size="large"
          onClick={() => {
            mintItem();
          }}
        >
          MINT NFT
        </Button>
      </div>
      <div style={{ margin: 32 }}>
        <span style={{ marginRight: 8 }}>🤖</span>
        An example prop of your balance{" "}
        <span style={{ fontWeight: "bold", color: "green" }}>({ethers.utils.formatEther(yourLocalBalance)})</span> was
        passed into the
        <span
          className="highlight"
          style={{ marginLeft: 4, /* backgroundColor: "#f9f9f9", */ padding: 4, borderRadius: 4, fontWeight: "bolder" }}
        >
          Home.jsx
        </span>{" "}
        component from
        <span
          className="highlight"
          style={{ marginLeft: 4, /* backgroundColor: "#f9f9f9", */ padding: 4, borderRadius: 4, fontWeight: "bolder" }}
        >
          App.jsx
        </span>
      </div>
    </div>
  );
}

export default Home;
