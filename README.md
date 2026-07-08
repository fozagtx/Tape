# Tape — On-Chain Limit Order Book

> 🏆 **Hackathon Project** — Built for BOT Chain

**Tape** is a fully on-chain limit order book. Every order placement, match, and cancellation is its own confirmed transaction on **BOT Chain** — a high-performance L1 EVM blockchain.

---

## How It Works

```
                     ┌─────────────┐
                     │   Trader     │
                     │  (Browser)   │
                     └──────┬──────┘
                            │ placeOrder(cancelOrder)
                            ▼
              ┌─────────────────────────┐
              │   TapeOrderBook.sol     │
              │   (Smart Contract)      │
              │                         │
              │   ┌─── Bids ───┐        │
              │   │ Price ↓    │        │
              │   │ 100 → 99   │        │
              │   └────────────┘        │
              │   ┌─── Asks ───┐        │
              │   │ Price ↑    │        │
              │   │ 101 → 102  │        │
              │   └────────────┘        │
              │                         │
              │   ┌─ Match Engine ─┐    │
              │   │ Price match?   │    │
              │   │ → Execute fill │    │
              │   └────────────────┘    │
              └──────────┬──────────────┘
                         │ events
                         ▼
              ┌─────────────────────────┐
              │   Next.js Frontend      │
              │   Live Order Book       │
              │   Trade Tape            │
              │   Market Stats          │
              └─────────────────────────┘
```

### Order Flow
1. **Place** — Trader submits a bid or ask with price & quantity → on-chain tx
2. **Match** — Contract checks if the order crosses the book → fills instantly
3. **Book** — Unfilled orders join a price-sorted linked list (bids descending, asks ascending)
4. **Cancel** — Trader removes their own order → on-chain tx
5. **Tape** — Frontend listens to contract events and displays the live feed

### Why BOT Chain?
BOT Chain's specs make per-order transactions economically viable:

| Spec | Value |
|------|-------|
| **Consensus** | SPoA (Staked Proof of Authority) |
| **Block Time** | 0.75s |
| **Finality** | ~0.9s |
| **EVM** | Yes (Solidity) |
| **Gas Cost** | ~0.001 BOT per tx |
| **Native Token** | BOT |
| **Testnet Chain ID** | `968` |
| **Testnet RPC** | `https://rpc.bohr.life` |
| **Mainnet Chain ID** | `677` |
| **Mainnet RPC** | `https://rpc.botchain.ai` |

---

## Deployed Contract

| Network | Address |
|---------|---------|
| **Testnet** | `0xFFFC911869A14f2D9d25A05D0CcA3BE7c6135cA8` |
| **Explorer** | [scan.bohr.life](https://scan.bohr.life/address/0xFFFC911869A14f2D9d25A05D0CcA3BE7c6135cA8) |

---

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

---

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

---

## Features

- **Live Order Book** — Depth visualization with animated updates
- **Limit Orders** — Buy/sell with price & quantity
- **Price Chart** — SVG sparkline with gradient area fill
- **Recent Trades** — Real-time trade tape with time-ago
- **My Orders** — Open/filled/cancelled with cancel action
- **Wallet Connect** — MetaMask + BOT Chain network switching
- **Seeded Data** — Full demo without wallet
- **Responsive** — Mobile-first design

---

## Links

- [BOT Chain Website](https://www.botchain.ai/)
- [Developer Docs](https://dev-docs.botchain.ai/docs/Developers/quick-guide/)
- [Testnet Faucet](https://faucet.botchain.ai/basic)
- [Block Explorer (Testnet)](https://scan.bohr.life)
- [Block Explorer (Mainnet)](https://scan.botchain.ai)
- [BOT DEX](https://dex.botchain.ai/)
- [BO Wallet](https://wallet.botchain.ai/)
- [Bridge](https://bridge.botchain.ai/)
- [GitHub](https://github.com/BOTChain-bot)

---

## License

MIT

