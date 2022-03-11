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

describe("LoogOwnership", function () {
  beforeEach(async function () {
    const [owner, rando, ...others] = await ethers.getSigners();
    const blockNumber = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNumber);

    this.owner = owner;
    this.rando = rando;
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

    context("setOwnersExplicit", async function () {
      const cost = PUBLIC_SALE_PRICE.mul(MAX_BATCH_SIZE);
      it("non-owner cannot setOwnersExplicit", async function () {
        await expect(
          this.loog.connect(this.others[0]).setOwnersExplicit(1)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("setOwnersExplicit can be called", async function () {
        await this.loog
          .connect(this.others[0])
          .mintPublicSale(MAX_BATCH_SIZE, PUBLIC_SALE_KEY, {
            value: cost,
          });
        await this.loog.connect(this.owner).setOwnersExplicit(MAX_BATCH_SIZE);
        {
          const { addr } = await this.loog
            .connect(this.others[0])
            .getOwnershipData(0);
          expect(addr).to.equal(this.others[0].address);
        }
        {
          const { addr } = await this.loog
            .connect(this.others[0])
            .getOwnershipData(MAX_BATCH_SIZE - 1);
          expect(addr).to.equal(this.others[0].address);
        }
      });
    });

    context("getOwnershipData", async function () {
      const cost = PUBLIC_SALE_PRICE.mul(MAX_BATCH_SIZE);
      it("can get TokenOwnership for a token", async function () {
        await this.loog
          .connect(this.others[0])
          .mintPublicSale(MAX_BATCH_SIZE, PUBLIC_SALE_KEY, {
            value: cost,
          });
        {
          const { addr } = await this.loog
            .connect(this.others[0])
            .getOwnershipData(0);
          expect(addr).to.equal(this.others[0].address);
        }
        {
          const { addr } = await this.loog
            .connect(this.others[0])
            .getOwnershipData(MAX_BATCH_SIZE - 1);
          expect(addr).to.equal(this.others[0].address);
        }
        await this.loog
          .connect(this.others[1])
          .mintPublicSale(MAX_BATCH_SIZE, PUBLIC_SALE_KEY, {
            value: cost,
          });
        {
          const { addr } = await this.loog
            .connect(this.others[1])
            .getOwnershipData(MAX_BATCH_SIZE);
          expect(addr).to.equal(this.others[1].address);
        }
        {
          const { addr } = await this.loog
            .connect(this.others[1])
            .getOwnershipData(MAX_BATCH_SIZE + MAX_BATCH_SIZE - 1);
          expect(addr).to.equal(this.others[1].address);
        }
      });

      it("any rando can get TokenOwnership for a token", async function () {
        await this.loog
          .connect(this.others[0])
          .mintPublicSale(MAX_BATCH_SIZE, PUBLIC_SALE_KEY, {
            value: cost,
          });
        const { addr } = await this.loog
          .connect(this.rando)
          .getOwnershipData(0);
        expect(addr).to.equal(this.others[0].address);
      });

      it("TokenOwnership not returned for a non-minted token", async function () {
        await this.loog
          .connect(this.others[0])
          .mintPublicSale(MAX_BATCH_SIZE, PUBLIC_SALE_KEY, {
            value: cost,
          });
        await expect(
          this.loog.connect(this.rando).getOwnershipData(MAX_BATCH_SIZE)
        ).to.be.revertedWith("OwnerQueryForNonexistentToken()");
      });
    });

    // it("Once tokens are mined, owner can withdraw money", async function () {
    //   const cost = PUBLIC_SALE_PRICE.mul(MAX_BATCH_SIZE);
    //   const ownerOldBalance = await ethers.provider.getBalance(
    //     this.owner.address
    //   );
    //   const saletx = await this.loog
    //     .connect(this.others[0])
    //     .mintPublicSale(MAX_BATCH_SIZE, PUBLIC_SALE_KEY, {
    //       value: cost,
    //     });
    //   expect(saletx.value).to.equal(cost);
    //   const contractBalance = await ethers.provider.getBalance(
    //     this.loog.address
    //   );
    //   expect(contractBalance).to.equal(cost);
    //   const withdrawtx = await this.loog.connect(this.owner).withdrawMoney();
    //   const ownerNewBalance = await ethers.provider.getBalance(
    //     this.owner.address
    //   );
    //   const receipt = await ethers.provider.getTransactionReceipt(
    //     withdrawtx.hash
    //   );
    //   const gasCost = receipt.effectiveGasPrice.mul(receipt.gasUsed);
    //   const actual = ownerOldBalance.sub(gasCost).add(cost);
    //   expect(ownerNewBalance).to.equal(actual);
    // });
  });
});
