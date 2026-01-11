import { useState, useEffect } from "react";
import { MARKETS, type MarketKey } from "@/lib/markets";
import { type Time } from "lightweight-charts";

export const useMarketData = (
  market: MarketKey,
) => {
  const [price, setPrice] = useState<number | null>(null);
  const [ohlcData, setOhlcData] = useState<any[]>([]);
  const [priceChange, setPriceChange] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const feed = MARKETS[market].pyth.replace("0x", "");

        const res = await fetch(`/api/market/${feed}?tf=24h`);
        const json = await res.json();

        setPrice(json.price);

        const arr = json.ohlc || [];
        setOhlcData(arr);

        if (arr.length > 1) {
          const open = arr[0].open;
          const close = arr[arr.length - 1].close;

          setPriceChange(((close - open) / open) * 100);
        }
      } catch (err) {
        console.error("market data", err);
      }
    };

    load();
    const h = setInterval(load, 30_000);
    return () => clearInterval(h);
  }, [market]);

  return { price, ohlcData, priceChange, marketCap: null };
};
