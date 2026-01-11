// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";
import "@pythnetwork/pyth-sdk-solidity/PythUtils.sol";

contract PythOracleAdapter {
    IPyth public immutable pyth;

    mapping(bytes32 => bool) public supportedFeedIds;

    constructor(address _pyth) {
        pyth = IPyth(_pyth);
    }

    function addAsset(bytes32 feedId) external {
        supportedFeedIds[feedId] = true;
    }

    function getPrice(bytes32 feedId) external view returns (uint256) {
        require(supportedFeedIds[feedId], "feed not supported");

        PythStructs.Price memory price = pyth.getPriceUnsafe(feedId);

        return PythUtils.convertToUint(price.price, price.expo, 18);
    }
}
