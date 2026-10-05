import { initialMarketIndices } from '../data/marketData';
import { MarketIndexQuote, Position } from '../types';

type TickCallback = (indices: MarketIndexQuote[], positionUpdates: Array<{ id: string; ltp: number; pnl: number; pnlPercent: number }>) => void;

class MarketDataService {
  private timer: ReturnType<typeof setInterval> | null = null;
  private currentIndices: MarketIndexQuote[] = [...initialMarketIndices];
  private subscribers: Set<TickCallback> = new Set();
  private isRunning: boolean = false;

  public subscribe(callback: TickCallback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  public start(getPositions: () => Position[]) {
    if (this.isRunning) return;
    this.isRunning = true;

    this.timer = setInterval(() => {
      // 1. Jitter Indices Quotes
      this.currentIndices = this.currentIndices.map((idx) => {
        const volatility = idx.symbol === 'INDIA VIX' ? 0.05 : idx.symbol === 'BANKNIFTY' ? 12.0 : 4.5;
        const delta = (Math.random() - 0.49) * volatility;
        const newLtp = parseFloat((idx.ltp + delta).toFixed(2));
        const newChange = parseFloat((newLtp - idx.prevClose).toFixed(2));
        const newPercent = parseFloat(((newChange / idx.prevClose) * 100).toFixed(2));

        const updatedSparkline = [...idx.sparkline.slice(1), newLtp];

        return {
          ...idx,
          ltp: newLtp,
          change: newChange,
          changePercent: newPercent,
          high: Math.max(idx.high, newLtp),
          low: Math.min(idx.low, newLtp),
          sparkline: updatedSparkline,
        };
      });

      // 2. Jitter Open Positions & calculate live P&L
      const activePositions = getPositions();
      const positionUpdates = activePositions.map((pos) => {
        const priceDelta = (Math.random() - 0.48) * 0.85;
        const newLtp = Math.max(1, parseFloat((pos.ltp + priceDelta).toFixed(2)));
        
        // PnL calculation: (LTP - AvgPrice) * Qty
        const netPnL = parseFloat(((newLtp - pos.avgPrice) * pos.qty).toFixed(2));
        const costBasis = Math.abs(pos.qty * pos.avgPrice);
        const netPercent = costBasis > 0 ? parseFloat(((netPnL / costBasis) * 100).toFixed(2)) : 0;

        return {
          id: pos.id,
          ltp: newLtp,
          pnl: netPnL,
          pnlPercent: netPercent,
        };
      });

      // 3. Notify all listeners
      this.subscribers.forEach((cb) => cb(this.currentIndices, positionUpdates));
    }, 1500);
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
  }

  public getStatus(): boolean {
    return this.isRunning;
  }

  public getLatestIndices(): MarketIndexQuote[] {
    return this.currentIndices;
  }
}

export const marketDataService = new MarketDataService();
