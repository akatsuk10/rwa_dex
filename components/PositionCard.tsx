"use client";

import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

type PositionCardProps = {
  marketName: string;
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
  onClose: (asset: `0x${string}`, pct: number, rawSize: bigint) => Promise<void>;
};

export const PositionCard = ({
  marketName,
  asset,
  rawSize,
  decoded,
  onClose,
}: PositionCardProps) => {
  const [closePercent, setClosePercent] = useState(100);
  const [loading, setLoading] = useState(false);

  const handleCloseClick = async () => {
    setLoading(true);
    await onClose(asset, closePercent, rawSize);
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between">
        <div>
          <h3 className="text-xl font-semibold">{marketName}/USD</h3>
          <Badge className="mt-2">
            {decoded.side} {decoded.lev.toFixed(1)}x
          </Badge>
        </div>

        <div className="text-right">
          <p className="text-xs text-muted-foreground">PnL</p>
          <p
            className={`text-2xl font-semibold ${
              decoded.pnl >= 0 ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {decoded.pnl >= 0 ? "+" : ""}
            {decoded.pnl.toFixed(2)} USD
          </p>
        </div>
      </div>

      <div className="rounded-xl border p-4 space-y-3">
        <div className="flex justify-between">
          <span>Size</span>
          <span>{decoded.absSize.toFixed(4)} {marketName}</span>
        </div>

        <div className="flex justify-between">
          <span>Entry</span>
          <span>${decoded.entry.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span>Margin</span>
          <span>${decoded.marginUsd.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span>Asset ID</span>
          <span className="font-mono text-xs">{asset.slice(0, 10)}...</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between">
          <span>Close Position</span>
          <span>{closePercent}%</span>
        </div>

        <Slider
          max={100}
          min={1}
          value={[closePercent]}
          onValueChange={(vals) => setClosePercent(vals[0])}
        />

        <Button
          onClick={handleCloseClick}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Closing..." : "Close Position"}
        </Button>
      </div>
    </motion.div>
  );
};
