import { useEffect, useState } from "react";
import { MARKETS, MarketKey } from "@/lib/markets";
import { PublicClient } from "viem";
import { ADAPTER_ADDRESS } from "@/lib/contracts";

const PYTH_ADAPTER_ABI = [
  {
    type: "function",
    name: "getPrice",
    stateMutability: "view",
    inputs: [{ name: "feedId", type: "bytes32" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const useAllPrices = (publicClient: PublicClient | undefined) => {
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!publicClient) return;

    const load = async () => {
      const promises = (Object.keys(MARKETS) as MarketKey[]).map(async (key) => {
        const { asset, pyth } = MARKETS[key];

        try {
          const price = await publicClient.readContract({
            address: ADAPTER_ADDRESS,
            abi: PYTH_ADAPTER_ABI,
            functionName: "getPrice",
            args: [pyth],
          });

          return { asset, price: Number(price) / 1e18 };
        } catch (e) {
          console.error("price error", key, e);
          return { asset, price: 0 };
        }
      });

      const results = await Promise.all(promises);
      const out: Record<string, number> = {};

      results.forEach(({ asset, price }) => {
        out[asset] = price;
      });

      setPrices(out);
    };

    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, [publicClient]);

  return prices;
};
