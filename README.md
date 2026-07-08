# Tape — On-Chain Limit Order Book

> 🏆 Hackathon Project — Built for BOT Chain

**Tape** is a fully on-chain limit order book. Every order placement, match, and cancellation is its own confirmed transaction on **BOT Chain** — a high-performance L1 EVM blockchain.

## How It Works

```mermaid
graph TB
    A[Trader Browser] -->|placeOrder / cancelOrder| B[TapeOrderBook.sol]
    B --> C{Match Engine}
    C -->|Fill| D[Order Book]
    D -->|Events| E[Next.js Frontend]
    E -->|Live UI| A
```

## Deploy the Contract

Tape ships **without** a pre-deployed contract. The address previously listed
here (`0xFFFC…5cA8`) was an empty stub with no order-book logic — it has been removed.

Deploy the real `TapeOrderBook` one of two ways:

1. **From the UI (recommended):** click **Connect Wallet**, switch to BOT Chain,
   then use the **Deploy New Contract** button on the home screen. The deployed
   address is saved to `localStorage` and the order book goes live immediately.
2. **Via Hardhat** (needs a funded deployer key on BOT Chain testnet):
   ```bash
   npx hardhat compile
   PRIVATE_KEY=0xYOUR_KEY npx hardhat run scripts/deploy.ts --network botchain-testnet
   ```
   Then paste the printed address into the **Load existing contract** field in the UI.

> The contract has no constructor args. Its creation bytecode is embedded in
> `lib/bytecode.ts`, regenerated from `contracts/TapeOrderBook.sol` via
> `node scripts/gen_bytecode.js`.

## Project Structure

```
tape/
├── app/                    # Next.js 16 App Router
│   ├── layout.tsx          # Root layout + WalletProvider
│   ├── page.tsx            # Main trading page
│   ├── globals.css         # Global styles + Tailwind v4
│   └── components/         # 9 UI components
├── lib/                    # Config, ABI, seed data
├── contracts/              # TapeOrderBook.sol
├── scripts/                # Deploy scripts
└── bot/                    # Market-making bot
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Deploy Your Own

```bash
npx hardhat compile
npx hardhat run scripts/deploy.ts --network botchain-testnet
```

## Features

- **Live Order Book** — On-chain depth, polled every 2s via `getBookSide`
- **Limit Orders** — Buy/sell with price (gwei) & quantity, matched on-chain
- **Recent Trades** — Real-time `OrderMatched` event tape
- **My Orders** — Open orders with on-chain cancel
- **Wallet Connect** — MetaMask + BOT Chain network switching
- **In-Browser Deploy** — Deploy the real contract from the UI (no CLI needed)
- **Responsive** — Mobile-first design

