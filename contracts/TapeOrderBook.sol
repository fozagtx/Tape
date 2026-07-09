// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Tape — Fully On-Chain Limit Order Book
 * @notice Every place, match, and cancel is its own confirmed tx.
 *         Designed for BOT Chain: 0.75s blocks + near-zero fees
 *         make per-order transactions economically viable.
 *
 *         Uses a price-sorted linked list per side.
 *         Buy side: highest price first (descending).
 *         Sell side: lowest price first (ascending).
 */
contract TapeOrderBook {
    // ── Types ──────────────────────────────────────────────

    struct Order {
        address trader;
        bool    isBuy;
        uint128 price;
        uint128 quantity;
        uint256 id;
        uint256 next;
        uint256 prev;
    }

    // ── State ──────────────────────────────────────────────

    mapping(uint256 => Order) public orders;
    uint256 public nextOrderId = 1;
    uint256 public buyHead;
    uint256 public sellHead;
    uint256 public totalBids;
    uint256 public totalAsks;
    uint256 public matchCount;

    // ── Events ─────────────────────────────────────────────

    event OrderPlaced(
        uint256 indexed id,
        address indexed trader,
        bool isBuy,
        uint128 price,
        uint128 quantity
    );
    event OrderMatched(
        uint256 indexed buyId,
        uint256 indexed sellId,
        address buyer,
        address seller,
        uint128 price,
        uint128 quantity
    );
    event OrderCancelled(uint256 indexed id, address indexed trader);
    event OrderFilled(uint256 indexed id);

    // ── Place Order ────────────────────────────────────────

    function placeOrder(bool isBuy, uint128 price, uint128 quantity) external returns (uint256 id) {
        require(price > 0, "price zero");
        require(quantity > 0, "qty zero");

        id = nextOrderId++;
        orders[id] = Order({
            trader:   msg.sender,
            isBuy:    isBuy,
            price:    price,
            quantity: quantity,
            id:       id,
            next:     0,
            prev:     0
        });

        emit OrderPlaced(id, msg.sender, isBuy, price, quantity);
        _match(id);

        if (orders[id].quantity > 0) {
            _insertIntoBook(id);
            if (isBuy) totalBids++; else totalAsks++;
        }
    }

    // ── Cancel Order ───────────────────────────────────────

    function cancelOrder(uint256 id) external {
        Order storage o = orders[id];
        require(o.trader == msg.sender, "not owner");
        require(o.quantity > 0, "already filled");

        bool wasBuy = o.isBuy;
        _removeFromBook(id);
        o.quantity = 0;
        if (wasBuy) {
            if (totalBids > 0) totalBids--;
        } else {
            if (totalAsks > 0) totalAsks--;
        }
        emit OrderCancelled(id, msg.sender);
    }

    // ── Matching Engine ────────────────────────────────────

    function _match(uint256 takerId) internal {
        Order storage taker = orders[takerId];

        while (taker.quantity > 0) {
            uint256 bestId = taker.isBuy ? sellHead : buyHead;
            if (bestId == 0) break;

            Order storage maker = orders[bestId];

            bool canMatch = taker.isBuy
                ? taker.price >= maker.price
                : taker.price <= maker.price;

            if (!canMatch) break;

            uint128 fillQty = taker.quantity < maker.quantity ? taker.quantity : maker.quantity;
            uint128 fillPrice = maker.price;

            taker.quantity -= fillQty;
            maker.quantity -= fillQty;

            matchCount++;
            emit OrderMatched(
                taker.isBuy ? takerId : bestId,
                taker.isBuy ? bestId : takerId,
                taker.isBuy ? taker.trader : maker.trader,
                taker.isBuy ? maker.trader : taker.trader,
                fillPrice,
                fillQty
            );

            if (maker.quantity == 0) {
                _removeFromBook(bestId);
                emit OrderFilled(bestId);
                if (maker.isBuy) totalBids--; else totalAsks--;
            }
        }

        if (taker.quantity == 0) {
            emit OrderFilled(takerId);
        }
    }

    // ── Book Insert / Remove ───────────────────────────────

    function _insertIntoBook(uint256 id) internal {
        Order storage o = orders[id];
        uint256 head = o.isBuy ? buyHead : sellHead;

        if (head == 0) {
            if (o.isBuy) buyHead = id; else sellHead = id;
            return;
        }

        uint256 curr = head;
        uint256 prev = 0;

        while (curr != 0) {
            Order storage c = orders[curr];
            bool shouldInsertBefore = o.isBuy
                ? o.price > c.price
                : o.price < c.price;

            if (shouldInsertBefore) break;
            prev = curr;
            curr = c.next;
        }

        o.prev = prev;
        o.next = curr;

        if (prev == 0) {
            if (o.isBuy) buyHead = id; else sellHead = id;
        } else {
            orders[prev].next = id;
        }
        if (curr != 0) {
            orders[curr].prev = id;
        }
    }

    function _removeFromBook(uint256 id) internal {
        Order storage o = orders[id];
        uint256 p = o.prev;
        uint256 n = o.next;

        if (p == 0) {
            if (o.isBuy) buyHead = n; else sellHead = n;
        } else {
            orders[p].next = n;
        }
        if (n != 0) {
            orders[n].prev = p;
        }

        o.prev = 0;
        o.next = 0;
    }

    // ── Views ──────────────────────────────────────────────

    function getOrder(uint256 id) external view returns (Order memory) {
        return orders[id];
    }

    function getBestBid() external view returns (uint128 price, uint128 quantity) {
        if (buyHead == 0) return (0, 0);
        Order storage o = orders[buyHead];
        return (o.price, o.quantity);
    }

    function getBestAsk() external view returns (uint128 price, uint128 quantity) {
        if (sellHead == 0) return (0, 0);
        Order storage o = orders[sellHead];
        return (o.price, o.quantity);
    }

    function getBookSide(bool isBuy, uint256 maxLen) external view
        returns (uint128[] memory prices, uint128[] memory quantities)
    {
        uint256 head = isBuy ? buyHead : sellHead;
        uint256 len = 0;
        uint256 curr = head;
        while (curr != 0 && len < maxLen) { len++; curr = orders[curr].next; }

        prices    = new uint128[](len);
        quantities = new uint128[](len);

        curr = head;
        for (uint256 i = 0; i < len; i++) {
            Order storage o = orders[curr];
            prices[i]    = o.price;
            quantities[i] = o.quantity;
            curr = o.next;
        }
    }

    function stats() external view returns (uint256, uint256, uint256, uint256) {
        return (nextOrderId - 1, totalBids, totalAsks, matchCount);
    }
}
