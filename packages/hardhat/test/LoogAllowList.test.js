/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

const MAX_BATCH_SIZE = 5;
const COLLECTION_SIZE = 10000;
const AMOUNT_FOR_DEVS = 200;
const ALLOW_LIST_PRICE = ethers.utils.parseEther("0.095");
const ALLOW_LIST_CID =
  "bafkreiedlq5amj4hatlwbhldkkjfrfaxxzlpax464hbhutrohpiji4ixji";

describe("LoogAllowList", function () {
  beforeEach(async function () {
    const [owner, ...allowListSigners] = await ethers.getSigners();
    this.owner = owner;
    this.allowListSigners = allowListSigners;
    // console.log(`allowListSigners=${allowListSigners}`);
    // allowListSigners.forEach((it) => console.log(it));
    this.allowListLeafs = allowListSigners.map((signer) =>
      keccak256(signer.address)
    );
    this.merkleTree = new MerkleTree(this.allowListLeafs, keccak256, {
      sortPairs: true,
    });

    this.LoogFactory = await ethers.getContractFactory("Loog");
    this.loog = await this.LoogFactory.deploy(
      MAX_BATCH_SIZE,
      COLLECTION_SIZE,
      AMOUNT_FOR_DEVS
    );
    await this.loog.deployed();
  });

  context("allow list not enabled", async function () {
    context("enableAllowList", async function () {
      it("non-owner cannot enable allow list", async function () {
        await expect(
          this.loog
            .connect(this.allowListSigners[0])
            .enableAllowList(
              ALLOW_LIST_PRICE,
              this.merkleTree.getRoot(),
              ALLOW_LIST_CID
            )
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("owner can enable allow list", async function () {
        await this.loog.enableAllowList(
          ALLOW_LIST_PRICE,
          this.merkleTree.getRoot(),
          ALLOW_LIST_CID
        );
        expect(await this.loog._allowListPrice()).to.equal(ALLOW_LIST_PRICE);
      });
    });

    context("mintAllowList", async function () {
      it("minting can't happen when the allow list is disabled", async function () {
        const signer = this.allowListSigners[0];
        const leafNode = keccak256(signer.address);
        const proof = this.merkleTree.getHexProof(leafNode);
        await expect(
          this.loog
            .connect(signer)
            .mintAllowList(1, proof, { value: ALLOW_LIST_PRICE })
        ).to.be.revertedWith("AllowListNotStarted()");
        expect(await this.loog.totalSupply()).to.equal(0);
      });
    });
  });

  context("allow list enabled", async function () {
    this.beforeEach(async function () {
      await this.loog.enableAllowList(
        ALLOW_LIST_PRICE,
        this.merkleTree.getRoot(),
        ALLOW_LIST_CID
      );
    });

    it("a user on the allowlist can mint a token", async function () {
      const signer = this.allowListSigners[0];
      const leafNode = keccak256(signer.address);
      const proof = this.merkleTree.getHexProof(leafNode);
      // console.log(leafNode);
      // console.log(proof);
      await this.loog
        .connect(signer)
        .mintAllowList(1, proof, { value: ALLOW_LIST_PRICE });
      expect(await this.loog.totalSupply()).to.equal(1);
    });

    it("all users on the allowlist can mint a token", async function () {
      const merkleTree = this.merkleTree;
      const loog = this.loog;
      let minted = 0;
      this.allowListSigners.forEach(async function (signer) {
        const leafNode = keccak256(signer.address);
        const proof = merkleTree.getHexProof(leafNode);
        await loog
          .connect(signer)
          .mintAllowList(1, proof, { value: ALLOW_LIST_PRICE });
        minted += 1;
      });
      expect(await this.loog.totalSupply()).to.equal(minted);
    });

    it("a user on the allowlist cannot mint a token with insufficient eth", async function () {
      const signer = this.allowListSigners[0];
      const leafNode = keccak256(signer.address);
      const proof = this.merkleTree.getHexProof(leafNode);
      await expect(
        this.loog
          .connect(signer)
          .mintAllowList(1, proof, { value: ALLOW_LIST_PRICE.sub(1) })
      ).to.be.revertedWith("NotEnoughEth()");
      expect(await this.loog.totalSupply()).to.equal(0);
    });

    it("a user on the allowlist can mint only one", async function () {
      const signer = this.allowListSigners[0];
      const leafNode = keccak256(signer.address);
      const proof = this.merkleTree.getHexProof(leafNode);
      await this.loog
        .connect(signer)
        .mintAllowList(1, proof, { value: ALLOW_LIST_PRICE });
      await expect(
        this.loog
          .connect(signer)
          .mintAllowList(1, proof, { value: ALLOW_LIST_PRICE })
      ).to.be.revertedWith("AllowListAddressSoldOut()");
      expect(await this.loog.totalSupply()).to.equal(1);
    });

    it("a user off the allowlist cannot mint a token", async function () {
      const cheater = this.owner;
      const signer = this.allowListSigners[0];
      const leafNode = keccak256(signer.address);
      const proof = this.merkleTree.getHexProof(leafNode);
      await expect(
        this.loog
          .connect(cheater)
          .mintAllowList(1, proof, { value: ALLOW_LIST_PRICE })
      ).to.be.revertedWith("AllowListAccessRequired()");
      expect(await this.loog.totalSupply()).to.equal(0);
    });
  });
});
