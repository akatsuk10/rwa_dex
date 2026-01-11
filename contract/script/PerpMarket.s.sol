// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/PerpMarket.sol";

contract DeployPerpMarket is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);

        address adapter = 0x00d2Bd9A1448b86d151D4b9111d8bBd9D00c665A;

        PerpMarketMulti market = new PerpMarketMulti(adapter);
        console2.log("PerpMarketMulti:", address(market));

        vm.stopBroadcast();
    }
}
