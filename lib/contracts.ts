export const MANTLE_RPC = "https://rpc.sepolia.mantle.xyz";

export const PYTH_ADDRESS = "0x98046Bd286715D3B0BC227Dd7a956b83D8978603";

export const ADAPTER_ADDRESS = "0x00d2Bd9A1448b86d151D4b9111d8bBd9D00c665A";
export const PERP_ADDRESS = "0xc9031529D0c8ac5770530f083dC5727a594ab5ec";

export const FEEDS = {
  BTC: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
  ETH: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
  MNT: "0x4e3037c822d852d79af3ac80e35eb420ee3b870dca49f9344a38ef4773fb0585",
  GOLD: "0x44465e17d2e9d390e70c999d5a11fda4f092847fcd2e3e5aa089d96c98a30e67",
};

export const PYTH_ABI = [
  {
    "type": "function",
    "name": "getPrice",
    "stateMutability": "view",
    "inputs": [
      { "name": "feedId", "type": "bytes32" }
    ],
    "outputs": [
      { "name": "", "type": "uint256" }
    ]
  }
] as const;

