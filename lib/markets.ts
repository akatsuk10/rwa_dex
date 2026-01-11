export type MarketKey = "XAUT" | "BTC" | "ETH" | "MNT";

export const MARKETS: Record<
  MarketKey,
  {
    name: string;
    coingecko: string;
    asset: `0x${string}`;
    pyth: `0x${string}`;
  }
> = {
  XAUT: {
    name: "Tether Gold",
    coingecko: "tether-gold",
    asset: "0x5858415554000000000000000000000000000000000000000000000000000000",
    pyth: "0x44465e17d2e9d390e70c999d5a11fda4f092847fcd2e3e5aa089d96c98a30e67",
  },
  BTC: {
    name: "Bitcoin",
    coingecko: "bitcoin",
    asset: "0x4254430000000000000000000000000000000000000000000000000000000000",
    pyth: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
  },
  ETH: {
    name: "Ethereum",
    coingecko: "ethereum",
    asset: "0x4554480000000000000000000000000000000000000000000000000000000000",
    pyth: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
  },
  MNT: {
    name: "Mantle",
    coingecko: "mantle",
    asset: "0x4d4e540000000000000000000000000000000000000000000000000000000000",
    pyth: "0x4e3037c822d852d79af3ac80e35eb420ee3b870dca49f9344a38ef4773fb0585",
  },
};
