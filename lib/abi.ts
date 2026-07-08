// TapeOrderBook Contract ABI
// Matches the Solidity contract in /contracts/TapeOrderBook.sol

export const TAPE_ABI = [
  // Write functions
  "function placeOrder(bool isBuy, uint128 price, uint128 quantity) external returns (uint256)",
  "function cancelOrder(uint256 id) external",

  // Read functions
  "function getOrder(uint256 id) external view returns (tuple(address trader, bool isBuy, uint128 price, uint128 quantity, uint256 id, uint256 next, uint256 prev))",
  "function getBestBid() external view returns (uint128 price, uint128 quantity)",
  "function getBestAsk() external view returns (uint128 price, uint128 quantity)",
  "function getBookSide(bool isBuy, uint256 maxLen) external view returns (uint128[] prices, uint128[] quantities)",
  "function stats() external view returns (uint256, uint256, uint256, uint256)",
  "function nextOrderId() external view returns (uint256)",
  "function buyHead() external view returns (uint256)",
  "function sellHead() external view returns (uint256)",
  "function totalBids() external view returns (uint256)",
  "function totalAsks() external view returns (uint256)",
  "function matchCount() external view returns (uint256)",

  // Events
  "event OrderPlaced(uint256 indexed id, address indexed trader, bool isBuy, uint128 price, uint128 quantity)",
  "event OrderMatched(uint256 indexed buyId, uint256 indexed sellId, address buyer, address seller, uint128 price, uint128 quantity)",
  "event OrderCancelled(uint256 indexed id, address indexed trader)",
  "event OrderFilled(uint256 indexed id)",
] as const;

export type OrderSide = "buy" | "sell";

export interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
  isBuy: boolean;
}

export interface Trade {
  id: string;
  buyOrderId: number;
  sellOrderId: number;
  buyer: string;
  seller: string;
  price: number;
  quantity: number;
  timestamp: number;
}

export interface PlacedOrder {
  id: number;
  trader: string;
  isBuy: boolean;
  price: number;
  quantity: number;
  filled: number;
  timestamp: number;
}

export interface BookStats {
  totalOrders: number;
  totalBids: number;
  totalAsks: number;
  totalMatches: number;
}
