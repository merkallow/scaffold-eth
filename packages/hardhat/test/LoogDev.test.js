/* eslint-disable no-unused-expressions */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
const { expect } = require("chai");
const { ethers } = require("hardhat");

const MAX_BATCH_SIZE = 5;
const COLLECTION_SIZE = 10000;
const AMOUNT_FOR_DEVS = 200;

describe("LoogDev", function () {
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

  context("devMint", async function () {
    it("can mint one token", async function () {
      await this.loog["devMint(address,uint256)"](this.addr1.address, 1);
      expect(await this.loog.totalSupply()).to.equal(1);
    });

    it("can mint MAX_BATCH_SIZE tokens", async function () {
      await this.loog["devMint(address,uint256)"](
        this.addr1.address,
        MAX_BATCH_SIZE
      );
      expect(await this.loog.totalSupply()).to.equal(MAX_BATCH_SIZE);
    });

    it("can't mint MAX_BATCH_SIZE+1 tokens", async function () {
      await expect(
        this.loog["devMint(address,uint256)"](
          this.addr1.address,
          MAX_BATCH_SIZE + 1
        )
      ).to.be.revertedWith("TooMany");
    });

    it("can't mint AMOUNT_FOR_DEVS+1 tokens", async function () {
      const little = await this.LoogFactory.deploy(2, 10, 3);
      await little.deployed();
      await little["devMint(address,uint256)"](this.addr1.address, 2);
      expect(await little.totalSupply()).to.equal(2);
      await expect(
        little["devMint(address,uint256)"](this.addr2.address, 2)
      ).to.be.revertedWith("AllDevTokensClaimed");
    });

    it("can't more than total amount of tokens", async function () {
      const little = await this.LoogFactory.deploy(2, 10, 100);
      await little.deployed();
      await little["devMint(address,uint256)"](this.addr1.address, 2);
      await little["devMint(address,uint256)"](this.addr1.address, 2);
      await little["devMint(address,uint256)"](this.addr1.address, 2);
      await little["devMint(address,uint256)"](this.addr1.address, 2);
      await little["devMint(address,uint256)"](this.addr1.address, 1);
      expect(await little.totalSupply()).to.equal(9);
      await expect(
        little["devMint(address,uint256)"](this.addr2.address, 2)
      ).to.be.revertedWith("SoldOut");
    });
  });
});
