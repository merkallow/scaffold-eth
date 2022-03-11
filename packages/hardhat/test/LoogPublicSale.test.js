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

describe("LoogPublicSale", function () {
  beforeEach(async function () {
    const [owner, ...allowListSigners] = await ethers.getSigners();
    const blockNumber = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNumber);

    this.owner = owner;
    this.allowListSigners = allowListSigners;

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

  context("public sale not enabled", async function () {
    context("setupPublicSale", async function () {
      it("non-owner cannot setupPublicSale", async function () {
        await expect(
          this.loog
            .connect(this.allowListSigners[0])
            .setupPublicSale(
              PUBLIC_SALE_PRICE,
              this.publicSaleStartTime,
              PUBLIC_SALE_KEY
            )
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("owner can setupPublicSale", async function () {
        await this.loog.setupPublicSale(
          PUBLIC_SALE_PRICE,
          this.publicSaleStartTime,
          PUBLIC_SALE_KEY
        );
        expect(await this.loog._publicSalePrice()).to.equal(
          PUBLIC_SALE_PRICE
        );
        expect(await this.loog._publicSaleStartTime()).to.equal(
          this.publicSaleStartTime
        );
        expect(await this.loog._publicSaleKey()).to.equal(PUBLIC_SALE_KEY);
      });
    });

    context("mintPublicSale", async function () {
      it("minting can't happen when the public sale is not ongoing", async function () {
        const signer = this.allowListSigners[0];
        await expect(
          this.loog
            .connect(signer)
            .mintPublicSale(1, PUBLIC_SALE_KEY, { value: PUBLIC_SALE_PRICE })
        ).to.be.revertedWith("PublicSaleNotOngoing()");
        expect(await this.loog.totalSupply()).to.equal(0);
      });
    });
  });

  context("public sale enabled but not ongoing", async function () {
    this.beforeEach(async function () {
      await this.loog.setupPublicSale(
        PUBLIC_SALE_PRICE,
        this.publicSaleStartTime,
        PUBLIC_SALE_KEY
      );
    });
    it("a rando cannot mint a token before the start time", async function () {
      const signer = this.allowListSigners[0];
      await expect(
        this.loog
          .connect(signer)
          .mintPublicSale(1, PUBLIC_SALE_KEY, { value: PUBLIC_SALE_PRICE })
      ).to.be.revertedWith("PublicSaleNotOngoing()");
      expect(await this.loog.totalSupply()).to.equal(0);
    });
    it("a rando cannot mint a token just before the start time", async function () {
      await ethers.provider.send("evm_mine", [this.publicSaleStartTime - 2]);
      const signer = this.allowListSigners[0];
      await expect(
        this.loog
          .connect(signer)
          .mintPublicSale(1, PUBLIC_SALE_KEY, { value: PUBLIC_SALE_PRICE })
      ).to.be.revertedWith("PublicSaleNotOngoing()");
      expect(await this.loog.totalSupply()).to.equal(0);
    });
    it("a rando can mint a token at start time", async function () {
      await ethers.provider.send("evm_mine", [this.publicSaleStartTime]);
      const signer = this.allowListSigners[0];
      await this.loog
        .connect(signer)
        .mintPublicSale(1, PUBLIC_SALE_KEY, { value: PUBLIC_SALE_PRICE });
      expect(await this.loog.totalSupply()).to.equal(1);
    });
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

    it("a rando cannot mint a token with the wrong publicSaleKey", async function () {
      const signer = this.allowListSigners[0];
      await expect(
        this.loog
          .connect(signer)
          .mintPublicSale(1, PUBLIC_SALE_KEY + 1, { value: PUBLIC_SALE_PRICE })
      ).to.be.revertedWith("PublicSaleKeyError()");
      expect(await this.loog.totalSupply()).to.equal(0);
    });

    it("a rando cannot mint a token with too little eth", async function () {
      const signer = this.allowListSigners[0];
      await expect(
        this.loog.connect(signer).mintPublicSale(1, PUBLIC_SALE_KEY, {
          value: PUBLIC_SALE_PRICE.sub(1),
        })
      ).to.be.revertedWith("NotEnoughEth()");
      expect(await this.loog.totalSupply()).to.equal(0);
    });

    it("a rando can mint up to MAX_BATCH_SIZE tokens", async function () {
      const signer = this.allowListSigners[0];
      await this.loog
        .connect(signer)
        .mintPublicSale(MAX_BATCH_SIZE, PUBLIC_SALE_KEY, {
          value: PUBLIC_SALE_PRICE.mul(MAX_BATCH_SIZE),
        });
      expect(await this.loog.totalSupply()).to.equal(MAX_BATCH_SIZE);
    });

    it("a rando cannot mint more than MAX_BATCH_SIZE tokens", async function () {
      const signer = this.allowListSigners[0];
      await expect(
        this.loog
          .connect(signer)
          .mintPublicSale(MAX_BATCH_SIZE + 1, PUBLIC_SALE_KEY, {
            value: PUBLIC_SALE_PRICE.mul(MAX_BATCH_SIZE + 1),
          })
      ).to.be.revertedWith("PublicSaleTooMany()");
      expect(await this.loog.totalSupply()).to.equal(0);
    });
  });
});
