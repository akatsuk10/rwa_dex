"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { MarketKey } from "@/lib/markets";

type TradePanelProps = {
  market: MarketKey;
  margin: string;
  setMargin: (value: string) => void;
  leverage: number;
  setLeverage: (value: number) => void;
  size: number;
  notional: number;
  price: number | null;
  canTrade: boolean;
  isConnected: boolean;
  loading: boolean;
  onOpenLong: () => void;
  onOpenShort: () => void;
};

const MAX_LEVERAGE = 10;

export const TradePanel = ({
  market,
  margin,
  setMargin,
  leverage,
  setLeverage,
  size,
  notional,
  price,
  canTrade,
  isConnected,
  loading,
  onOpenLong,
  onOpenShort,
}: TradePanelProps) => {
  return (
    <Card className="border-none shadow-xl">
      <CardHeader>
        <CardTitle>Trade {market}</CardTitle>
        <CardDescription>Open a long or short position</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pt-4">
        {/* Leverage Slider */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Leverage</Label>
            <Badge variant="outline">{leverage}x</Badge>
          </div>
          <Slider
            max={MAX_LEVERAGE}
            min={1}
            step={1}
            value={[leverage]}
            onValueChange={(vals) => setLeverage(vals[0])}
          />
        </div>

        {/* Margin */}
        <div className="space-y-2">
          <Label>Margin (MNT)</Label>
          <Input type="number" value={margin} onChange={(e) => setMargin(e.target.value)} />
        </div>

        {/* Summary */}
        <div className="bg-secondary p-4 rounded-xl space-y-3">
          <div className="flex justify-between">
            <span>Position Size</span>
            <span>{size.toFixed(4)} {market}</span>
          </div>

          <div className="flex justify-between">
            <span>Notional Value</span>
            <span>${notional.toFixed(2)}</span>
          </div>

          <Separator />

          <div className="flex justify-between font-semibold">
            <span>Total Cost</span>
            <span>{margin} MNT</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button className="bg-emerald-600" disabled={!canTrade} onClick={onOpenLong}>Long</Button>
          <Button className="bg-rose-600" disabled={!canTrade} onClick={onOpenShort}>Short</Button>
        </div>

        {!isConnected && <p className="text-xs text-center text-muted-foreground">Connect wallet to trade</p>}
      </CardContent>
    </Card>
  );
};
