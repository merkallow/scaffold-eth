import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch } from "antd";
import React, { useState } from "react";
import { utils } from "ethers";
import { SyncOutlined } from "@ant-design/icons";
import { useContractReader } from "eth-hooks";
import { Address, Balance, Events } from "../components";
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

const ALLOW_LIST_PRICE = utils.parseEther("0.01");

export default function ExampleUI({
  purpose,
  address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
}) {
  const [newPurpose, setNewPurpose] = useState("loading...");
  const _allowListCid = useContractReader(readContracts, "Loog", "_allowListCid");

  const mintItem = async () => {
    console.log(` 🍾 Mint NFT for address=${address}`);
    const hashedAddress = keccak256(address).toString("hex");
    console.log(` 🍾 hashedAddress=${hashedAddress}`);

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

    const result = tx(
      writeContracts && writeContracts.Loog && writeContracts.Loog.mintAllowList(1, proof, { value: ALLOW_LIST_PRICE }),
      update => {
        console.log("📡 Transaction Update:", update);
        if (update && (update.status === "confirmed" || update.status === 1)) {
          console.log(" 🍾 Transaction " + update.hash + " finished!");
          console.log(
            " ⛽️ " +
              update.gasUsed +
              "/" +
              (update.gasLimit || update.gas) +
              " @ " +
              parseFloat(update.gasPrice) / 1000000000 +
              " gwei",
          );
        }
      },
    );
  };

  return (
    <div>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <h2>Loog Minter:</h2>
        <div>
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
      </div>

      {/*
        📑 Maybe display a list of events?
          (uncomment the event and emit line in YourContract.sol! )
      */}
      <Events
        contracts={readContracts}
        contractName="Loog"
        eventName="Transfer"
        localProvider={localProvider}
        mainnetProvider={mainnetProvider}
        startBlock={1}
      />
    </div>
  );
}
