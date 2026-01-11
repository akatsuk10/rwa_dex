// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/PythOracleAdapter.sol";

contract DeployOracle is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);

        address PYTH = 0x98046Bd286715D3B0BC227Dd7a956b83D8978603;

        PythOracleAdapter oracle = new PythOracleAdapter(PYTH);
        console2.log("Oracle:", address(oracle));

        vm.stopBroadcast();
    }
}
