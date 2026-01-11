import { useCallback, useEffect, useState } from "react";
import { PublicClient } from "viem";
import { ethers } from "ethers";
import { PERP_ADDRESS } from "@/lib/contracts";
import PERP_ABI from "@/lib/PerpMarket.json";
import { MARKETS } from "@/lib/markets";

export type FullPosition = {
  market: string;
  asset: `0x${string}`;
  rawSize: bigint;
  decoded: {
    side: string;
    absSize: number;
    entry: number;
    marginUsd: number;
    pnl: number;
    lev: number;
  };
};

export const useAllPositions = (
  user: `0x${string}` | undefined,
  publicClient: PublicClient | undefined,
  allPrices: Record<string, number>,
  activeTab: "market" | "positions"
) => {
  const [positions, setPositions] = useState<FullPosition[]>([]);
  const [initialLoad, setInitialLoad] = useState(true);

  const reload = useCallback(async () => {
    if (!user || !publicClient) return;
    if (Object.keys(allPrices).length === 0) return; 

    const out: FullPosition[] = [];

    for (const m of Object.values(MARKETS)) {
      const asset = m.asset;

      try {
        const raw = await publicClient.readContract({
          address: PERP_ADDRESS,
          abi: PERP_ABI.abi,
          functionName: "positions",
          args: [user, asset],
        });

        const [size, entryPrice, margin] = raw as [bigint, bigint, bigint];
        if (size === BigInt(0)) continue;

        const price = allPrices[asset] ?? 0;
        if (!price) continue; // ❗ avoid wrong PnL & lev

        const abs = size < 0 ? -size : size;
        const absSize = Number(ethers.formatUnits(abs, 18));
        const entry = Number(ethers.formatUnits(entryPrice, 18));
        const marginUsd = Number(ethers.formatUnits(margin, 18));

        const side = size > 0 ? "LONG" : "SHORT";

        const pnl = (price - entry) * absSize * (side === "LONG" ? 1 : -1);
        const lev = marginUsd > 0 ? (absSize * price) / marginUsd : 0;

        out.push({
          market: m.name,
          asset,
          rawSize: size,
          decoded: { side, absSize, entry, marginUsd, pnl, lev },
        });
      } catch (err) {
        console.error("❌ Position error:", m.name, err);
      }
    }

    setPositions(out);
    setInitialLoad(false);
  }, [user, publicClient, allPrices]);

  useEffect(() => {
    if (activeTab !== "positions") return;

    reload();

    const id = setInterval(reload, 10000);
    return () => clearInterval(id);
  }, [activeTab, reload]);

  return { positions, reload, initialLoad };
};
