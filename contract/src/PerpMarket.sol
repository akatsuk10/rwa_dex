// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "openzeppelin-contracts/security/ReentrancyGuard.sol";
import "./PythOracleAdapter.sol";

contract PerpMarketMulti is ReentrancyGuard {

    struct Position {
        int256 size; 
        int256 entryPrice;
        int256 margin;
    }

    struct AssetConfig {
        bytes32 feedId;
        uint256 initMarginBps;
        uint256 maintMarginBps;
        uint256 takerFeeBps;
        bool enabled;
    }

    PythOracleAdapter public immutable oracle;

    mapping(bytes32 => AssetConfig) public assets;
    mapping(address => mapping(bytes32 => Position)) public positions;

    uint256 public protocolFees;
    address public owner;

    event AssetAdded(bytes32 indexed asset, bytes32 feedId);
    event PositionOpened(address indexed trader, bytes32 indexed asset, bool isLong, uint256 size, uint256 margin, uint256 price);
    event PositionClosed(address indexed trader, bytes32 indexed asset, uint256 sizeClosed, int256 pnl, uint256 price);
    event Liquidated(address indexed trader, bytes32 indexed asset, address liquidator, uint256 reward);

    modifier onlyOwner() {
        require(msg.sender == owner, "owner");
        _;
    }

    constructor(address _oracle) {
        oracle = PythOracleAdapter(_oracle);
        owner = msg.sender;
    }

    function addAsset(
        bytes32 asset,
        bytes32 feedId,
        uint256 initMargin,
        uint256 maintMargin,
        uint256 takerFee
    ) external onlyOwner {
        assets[asset] = AssetConfig({
            feedId: feedId,
            initMarginBps: initMargin,
            maintMarginBps: maintMargin,
            takerFeeBps: takerFee,
            enabled: true
        });

        oracle.addAsset(feedId);
        emit AssetAdded(asset, feedId);
    }

    function _abs(int256 x) internal pure returns (uint256) {
        return uint256(x >= 0 ? x : -x);
    }

    function _notionalUsd(int256 size, uint256 price) internal pure returns (uint256) {
        return _abs(size) * price / 1e18;
    }

    function _marginUsd(int256 margin) internal pure returns (uint256) {
        return uint256(margin);
    }

    function maxNotional(uint256 marginUsd, uint256 initMarginBps) public pure returns (uint256) {
        return (marginUsd * 1e4) / initMarginBps;
    }

    function openPosition(
        bytes32 asset,
        bool isLong,
        uint256 sizeDelta,
        uint256 marginDelta
    ) external payable nonReentrant {
        require(sizeDelta > 0, "size=0");
        require(msg.value == marginDelta, "bad value");
        AssetConfig memory cfg = assets[asset];
        require(cfg.enabled, "disabled");

        uint256 price = oracle.getPrice(cfg.feedId);

        Position storage pos = positions[msg.sender][asset];
        pos.margin += int256(marginDelta);

        int256 delta = isLong ? int256(sizeDelta) : -int256(sizeDelta);

        uint256 notionalUsd = sizeDelta * price / 1e18;
        uint256 feeUsd = (notionalUsd * cfg.takerFeeBps) / 1e4;

        require(pos.margin >= int256(feeUsd), "fee>margin");
        pos.margin -= int256(feeUsd);
        protocolFees += feeUsd;

        if (pos.size == 0) {
            pos.size = delta;
            pos.entryPrice = int256(price);
        } else if ((pos.size > 0 && delta > 0) || (pos.size < 0 && delta < 0)) {
            int256 newSize = pos.size + delta;
            pos.entryPrice = (pos.entryPrice * pos.size + int256(price) * delta) / newSize;
            pos.size = newSize;
        } else {
            pos.size += delta;
            if (pos.size == 0) pos.entryPrice = 0;
        }

        require(pos.size != 0, "zero");

        uint256 marginUsd = _marginUsd(pos.margin);
        uint256 totalNotional = _notionalUsd(pos.size, price);
        require(totalNotional <= maxNotional(marginUsd, cfg.initMarginBps), "leverage");

        emit PositionOpened(msg.sender, asset, isLong, sizeDelta, marginDelta, price);
    }

    function closePosition(bytes32 asset, uint256 sizeDelta) external nonReentrant {
        require(sizeDelta > 0, "size=0");
        AssetConfig memory cfg = assets[asset];
        require(cfg.enabled, "disabled");

        uint256 price = oracle.getPrice(cfg.feedId);
        Position storage pos = positions[msg.sender][asset];
        require(pos.size != 0, "no pos");

        int256 delta = pos.size > 0 ? int256(sizeDelta) : -int256(sizeDelta);
        require(_abs(delta) <= _abs(pos.size), "too much");

        int256 pnl = (int256(price) - pos.entryPrice) * delta / int256(1e18);
        pos.margin += pnl;

        uint256 feeUsd = (sizeDelta * price / 1e18 * cfg.takerFeeBps) / 1e4;
        require(pos.margin >= int256(feeUsd), "fee>margin");

        pos.margin -= int256(feeUsd);
        protocolFees += feeUsd;

        pos.size -= delta;

        if (pos.size == 0) {
            int256 payout = pos.margin;
            delete positions[msg.sender][asset];
            require(payout > 0, "bankrupt");
            payable(msg.sender).transfer(uint256(payout));
        }

        emit PositionClosed(msg.sender, asset, sizeDelta, pnl, price);
    }

    function liquidate(address trader, bytes32 asset) external nonReentrant {
        AssetConfig memory cfg = assets[asset];
        require(cfg.enabled, "disabled");

        uint256 price = oracle.getPrice(cfg.feedId);
        Position storage pos = positions[trader][asset];
        require(pos.size != 0, "no pos");

        uint256 notional = _notionalUsd(pos.size, price);

        int256 pnl = (int256(price) - pos.entryPrice) * pos.size / int256(1e18);
        int256 equity = pos.margin + pnl;
        require(equity > 0, "bankrupt");

        uint256 maint = (notional * cfg.maintMarginBps) / 1e4;
        require(uint256(equity) < maint, "safe");

        uint256 reward = uint256(equity) / 10;
        protocolFees += uint256(equity) - reward;

        delete positions[trader][asset];
        payable(msg.sender).transfer(reward);

        emit Liquidated(trader, asset, msg.sender, reward);
    }
}
