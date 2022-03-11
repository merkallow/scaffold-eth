/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
const { expect } = require("chai");
const { ethers } = require("hardhat");

const MAX_BATCH_SIZE = 5;
const COLLECTION_SIZE = 10000;
const AMOUNT_FOR_DEVS = 200;

const PUBLIC_SALE_PRICE = ethers.utils.parseEther("0.095");
const PUBLIC_SALE_START_TIME_OFFSET = 5 * 24 * 60 * 60; // 5 days from now
const PUBLIC_SALE_KEY = 123;

describe("LoogBase", function () {
  beforeEach(async function () {
    const [owner, ...others] = await ethers.getSigners();
    const blockNumber = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNumber);

    this.owner = owner;
    this.others = others;

    this.timestamp = block.timestamp;
    this.publicSaleStartTime = block.timestamp + PUBLIC_SALE_START_TIME_OFFSET;

    this.LoogFactory = await ethers.getContractFactory("Loog");
    this.loog = await this.LoogFactory.deploy(
      MAX_BATCH_SIZE,
      COLLECTION_SIZE,
      AMOUNT_FOR_DEVS
    );
    await this.loog.deployed();
  });

  context("public sale enabled and ongoing", async function () {
    this.beforeEach(async function () {
      await this.loog.setupPublicSale(
        PUBLIC_SALE_PRICE,
        this.publicSaleStartTime,
        PUBLIC_SALE_KEY
      );
      await ethers.provider.send("evm_mine", [this.publicSaleStartTime]);
    });

    it("minting a token will receive change if too much eth sent", async function () {
      const signer = this.others[0];

      const signerBalPre = await ethers.provider.getBalance(signer.address);
      const saletx = await this.loog
        .connect(signer)
        .mintPublicSale(1, PUBLIC_SALE_KEY, {
          value: PUBLIC_SALE_PRICE.mul(2),
        });
      const signerBalPost = await ethers.provider.getBalance(signer.address);

      const saleReceipt = await ethers.provider.getTransactionReceipt(
        saletx.hash
      );
      const gasCost = saleReceipt.effectiveGasPrice.mul(saleReceipt.gasUsed);
      const actual = signerBalPre.sub(gasCost).sub(PUBLIC_SALE_PRICE);
      expect(signerBalPost).to.be.equal(actual);

      // console.log(saletx);
      // console.log(saletx.value.toString());
      // console.log(saleReceipt);
    });
  });
});
