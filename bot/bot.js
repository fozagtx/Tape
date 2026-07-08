// Tape Market-Maker Bot — spams orders every block to flood the explorer
// Usage: PRIVATE_KEY=0x... CONTRACT=0x... RPC=https://... node bot.js

const { ethers } = require("ethers");

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT    = process.env.CONTRACT;
const RPC         = process.env.RPC || "https://rpc.bohr.life";

if (!PRIVATE_KEY || !CONTRACT) {
  console.error("Set PRIVATE_KEY and CONTRACT env vars");
  process.exit(1);
}

const ABI = [
  "function placeOrder(bool isBuy, uint128 price, uint128 quantity) external returns (uint256)",
  "function cancelOrder(uint256 id) external",
  "function getBestBid() view returns (uint128 price, uint128 quantity)",
  "function getBestAsk() view returns (uint128 price, uint128 quantity)",
  "function stats() view returns (uint256, uint256, uint256, uint256)",
  "event OrderPlaced(uint256 indexed id, address indexed trader, bool isBuy, uint128 price, uint128 quantity)",
  "event OrderMatched(uint256 indexed buyId, uint256 indexed sellId, address buyer, address seller, uint128 price, uint128 quantity)",
  "event OrderCancelled(uint256 indexed id, address indexed trader)",
];

const BASE_PRICE = ethers.parseUnits("100", "gwei"); // 100 gwei base

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC);
  const wallet   = new ethers.Wallet(PRIVATE_KEY, provider);
  const book     = new ethers.Contract(CONTRACT, ABI, wallet);

  console.log(`Bot: ${wallet.address}`);
  console.log(`Book: ${CONTRACT}`);

  let placed = [];

  // Listen to matches for the tape
  book.on("OrderMatched", (buyId, sellId, buyer, seller, price, qty) => {
    const p = ethers.formatUnits(price, "gwei");
    console.log(`⚡ MATCH #${buyId}×#${sellId} | ${p} gwei × ${qty}`);
  });

  book.on("OrderPlaced", (id, trader, isBuy, price, qty) => {
    const side = isBuy ? "BID" : "ASK";
    const p = ethers.formatUnits(price, "gwei");
    console.log(`📝 ${side} #${id} | ${p} gwei × ${qty}`);
  });

  // Main loop: place orders every 750ms
  setInterval(async () => {
    try {
      // Cancel old orders to keep book clean (keep last 10)
      while (placed.length > 10) {
        const old = placed.shift();
        try { await (await book.cancelOrder(old)).wait(); } catch(e) {}
      }

      // Random walk around base price
      const jitter = Math.floor((Math.random() - 0.5) * 20); // ±10 gwei
      const bidPrice = BASE_PRICE + ethers.parseUnits(String(100 + jitter), "gwei");
      const askPrice = BASE_PRICE + ethers.parseUnits(String(102 + jitter), "gwei");
      const qty = 1 + Math.floor(Math.random() * 5);

      // Place bid
      const tx1 = await book.placeOrder(true, bidPrice, qty);
      const r1 = await tx1.wait();
      const bidId = r1.logs.find(l => l.fragment?.name === "OrderPlaced")?.args?.id;
      if (bidId) placed.push(bidId);

      // Place ask
      const tx2 = await book.placeOrder(false, askPrice, qty);
      const r2 = await tx2.wait();
      const askId = r2.logs.find(l => l.fragment?.name === "OrderPlaced")?.args?.id;
      if (askId) placed.push(askId);

    } catch(e) {
      console.error("Bot error:", e.reason || e.message);
    }
  }, 750);

  // Stats every 5s
  setInterval(async () => {
    try {
      const [total, bids, asks, matches] = await book.stats();
      console.log(`📊 orders:${total} bids:${bids} asks:${asks} matches:${matches}`);
    } catch(e) {}
  }, 5000);
}

main().catch(console.error);
