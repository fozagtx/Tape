import { expect } from "chai";
import { ethers } from "hardhat";

describe("TapeOrderBook", function () {
  async function deployFixture() {
    const [owner, trader1, trader2] = await ethers.getSigners();
    const TapeOrderBook = await ethers.getContractFactory("TapeOrderBook");
    const book = await TapeOrderBook.deploy();
    await book.waitForDeployment();
    return { book, owner, trader1, trader2 };
  }

  describe("Deployment", () => {
    it("should deploy with zero state", async () => {
      const { book } = await deployFixture();
      const [total, bids, asks, matches] = await book.stats();
      expect(total).to.equal(0n);
      expect(bids).to.equal(0n);
      expect(asks).to.equal(0n);
      expect(matches).to.equal(0n);
    });
  });

  describe("Placing Orders", () => {
    it("should place a bid", async () => {
      const { book, trader1 } = await deployFixture();
      await book.connect(trader1).placeOrder(true, 100, 10);
      const [total, bids] = await book.stats();
      expect(total).to.equal(1n);
      expect(bids).to.equal(1n);
    });

    it("should place an ask", async () => {
      const { book, trader1 } = await deployFixture();
      await book.connect(trader1).placeOrder(false, 101, 10);
      const [total, , asks] = await book.stats();
      expect(total).to.equal(1n);
      expect(asks).to.equal(1n);
    });

    it("should reject zero price", async () => {
      const { book, trader1 } = await deployFixture();
      await expect(
        book.connect(trader1).placeOrder(true, 0, 10)
      ).to.be.revertedWith("price zero");
    });

    it("should reject zero quantity", async () => {
      const { book, trader1 } = await deployFixture();
      await expect(
        book.connect(trader1).placeOrder(true, 100, 0)
      ).to.be.revertedWith("qty zero");
    });
  });

  describe("Matching", () => {
    it("should match a bid with an ask", async () => {
      const { book, trader1, trader2 } = await deployFixture();
      await book.connect(trader1).placeOrder(false, 100, 5); // ask at 100
      await book.connect(trader2).placeOrder(true, 100, 5);  // bid at 100
      const [, , , matches] = await book.stats();
      expect(matches).to.equal(1n);
    });

    it("should not match if prices don't cross", async () => {
      const { book, trader1, trader2 } = await deployFixture();
      await book.connect(trader1).placeOrder(false, 101, 5); // ask at 101
      await book.connect(trader2).placeOrder(true, 100, 5);  // bid at 100
      const [, bids, asks] = await book.stats();
      expect(bids).to.equal(1n);
      expect(asks).to.equal(1n);
    });
  });

  describe("Cancellation", () => {
    it("should cancel an order", async () => {
      const { book, trader1 } = await deployFixture();
      const tx = await book.connect(trader1).placeOrder(true, 100, 10);
      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (l: any) => l.fragment?.name === "OrderPlaced"
      );
      const id = (event?.args as any)?.id;
      await book.connect(trader1).cancelOrder(id);
      const order = await book.getOrder(id);
      expect(order.quantity).to.equal(0n);
    });

    it("should reject cancel from non-owner", async () => {
      const { book, trader1, trader2 } = await deployFixture();
      const tx = await book.connect(trader1).placeOrder(true, 100, 10);
      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (l: any) => l.fragment?.name === "OrderPlaced"
      );
      const id = (event?.args as any)?.id;
      await expect(
        book.connect(trader2).cancelOrder(id)
      ).to.be.revertedWith("not owner");
    });
  });
});
