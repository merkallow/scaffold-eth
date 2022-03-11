/* eslint-disable no-unused-expressions */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
const { expect } = require("chai");
const { ethers } = require("hardhat");

// const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
// const RECEIVER_MAGIC_VALUE = "0x150b7a02";
// const GAS_MAGIC_VALUE = 20000;

const MAX_BATCH_SIZE = 5;
const COLLECTION_SIZE = 10000;
const AMOUNT_FOR_DEVS = 200;

describe("Loog", function () {
  beforeEach(async function () {
    const [owner, addr1, addr2, addr3] = await ethers.getSigners();
    this.owner = owner;
    this.addr1 = addr1;
    this.addr2 = addr2;
    this.addr3 = addr3;

    this.LoogFactory = await ethers.getContractFactory("Loog");
    this.loog = await this.LoogFactory.deploy(
      MAX_BATCH_SIZE,
      COLLECTION_SIZE,
      AMOUNT_FOR_DEVS
    );
    await this.loog.deployed();
  });

  context("with no minted tokens", async function () {
    it("has 0 totalSupply", async function () {
      const supply = parseInt(await this.loog.totalSupply(), 10);
      expect(supply).to.equal(0);
    });
  });

  context("with minted tokens", async function () {
    beforeEach(async function () {
      await this.loog["devMint(address,uint256)"](this.addr1.address, 1);
    });

    it("has >0 totalSupply", async function () {
      const supply = parseInt(await this.loog.totalSupply(), 10);
      expect(supply).gt(0);
    });

    it("tokenURI is always an empty string before setBaseURI is called", async function () {
      const uri = await this.loog.tokenURI(0);
      expect(uri).to.be.equal("");
    });

    it("tokenURI is 'baseURI + token number once setBaseURI is called", async function () {
      const baseURI = "http://ipfs/bla/";
      await this.loog.setBaseURI(baseURI);
      const uri = await this.loog.tokenURI(0);
      expect(uri).to.be.equal(baseURI + "0");
    });
  });
});
