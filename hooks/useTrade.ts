import { useState } from "react";
import { ethers } from "ethers";
import { type WalletClient } from "viem";
import { toast } from "sonner";
import { PERP_ADDRESS } from "@/lib/contracts";
import PERP_ABI from "@/lib/PerpMarket.json";

export const useTrade = (
  reloadAll: () => Promise<void>
) => {
  const [loading, setLoading] = useState(false);

  const openPosition = async (
    walletClient: WalletClient,
    asset: `0x${string}`,
    isLong: boolean,
    size: number,
    margin: string
  ) => {
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();
      const perp = new ethers.Contract(PERP_ADDRESS, PERP_ABI.abi, signer);

      const sizeDelta = ethers.parseUnits(size.toFixed(6), 18);
      const marginDelta = ethers.parseEther(margin);

      const tx = await perp.openPosition(asset, isLong, sizeDelta, marginDelta, {
        value: marginDelta,
      });

      await tx.wait();
      toast.success("Position opened");

      await reloadAll();
    } catch (e: any) {
      console.error("open error:", e);
      toast.error(e?.reason || "Open failed");
    } finally {
      setLoading(false);
    }
  };

  const closePosition = async (
    walletClient: WalletClient,
    asset: `0x${string}`, 
    posSize: bigint,     
    pct: number
  ) => {
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();
      const perp = new ethers.Contract(PERP_ADDRESS, PERP_ABI.abi, signer);

      const abs = posSize < BigInt(0) ? -posSize : posSize;
      const sizeToClose = (abs * BigInt(pct)) / BigInt(100);

      const tx = await perp.closePosition(asset, sizeToClose);
      await tx.wait();

      toast.success("Position closed");
      await reloadAll();
    } catch (e: any) {
      console.error("close error:", e);
      toast.error(e?.reason || "Close failed");
    } finally {
      setLoading(false);
    }
  };

  return { loading, openPosition, closePosition };
};
