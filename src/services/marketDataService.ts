import { MarketIndexQuote, Position } from '../types';
import { apiGetLiveIndices } from './apiClient';

type TickCallback = (indices: MarketIndexQuote[], positionUpdates: Array<{ id: string; ltp: number; pnl: number; pnlPercent: number }>) => void;

class MarketDataService {
  private timer: ReturnType<typeof setInterval> | null = null;
  private currentIndices: MarketIndexQuote[] = [
    {
      symbol: 'NIFTY 50',
      name: 'NIFTY 50 Index',
      ltp: 22550.00,
      change: 0,
      changePercent: 0,
      high: 22600.00,
      low: 22480.00,
      open: 22510.00,
      prevClose: 22500.00,
      sparkline: [22500, 22520, 22550],
    },
    {
      symbol: 'BANKNIFTY',
      name: 'Nifty Bank Index',
      ltp: 54700.00,
      change: 0,
      changePercent: 0,
      high: 55100.00,
      low: 54400.00,
      open: 54600.00,
      prevClose: 54500.00,
      sparkline: [54500, 54620, 54700],
    },
    {
      symbol: 'SENSEX',
      name: 'BSE Sensex 30',
      ltp: 72350.00,
      change: 0,
      changePercent: 0,
      high: 72600.00,
      low: 71900.00,
      open: 72100.00,
      prevClose: 72000.00,
      sparkline: [72000, 72200, 72350],
    },
  ];
  private subscribers: Set<TickCallback> = new Set();
  private isRunning: boolean = false;

  public subscribe(callback: TickCallback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private async fetchLiveQuotes() {
    try {
      const liveIndices = await apiGetLiveIndices();
      if (Array.isArray(liveIndices) && liveIndices.length > 0) {
        this.currentIndices = liveIndices.map((item: any) => {
          const prev = this.currentIndices.find((c) => c.symbol === item.symbol);
          const sparkline = prev ? [...prev.sparkline.slice(-15), item.price] : [item.previousClose || item.price, item.price];
          return {
            symbol: item.symbol,
            name: item.symbol === 'NIFTY 50' ? 'NIFTY 50 Index' : item.symbol === 'BANKNIFTY' ? 'Nifty Bank' : item.symbol,
            ltp: item.price,
            change: item.change,
            changePercent: item.changePercent,
            high: item.high,
            low: item.low,
            open: item.previousClose,
            prevClose: item.previousClose,
            sparkline,
          };
        });
      }
    } catch (err: any) {
      // Backend temporarily offline, keep previous prices
    }
  }

  public start(getPositions: () => Position[]) {
    if (this.isRunning) return;
    this.isRunning = true;

    // Immediate initial fetch
    this.fetchLiveQuotes().then(() => {
      this.subscribers.forEach((cb) => cb(this.currentIndices, []));
    });

    this.timer = setInterval(async () => {
      // 1. Fetch real market indices from backend
      await this.fetchLiveQuotes();

      // 2. Calculate live P&L on real active positions
      const activePositions = getPositions() || [];
      const positionUpdates = activePositions.map((pos) => {
        const matchingIndex = this.currentIndices.find((idx: MarketIndexQuote) => pos.symbol.includes(idx.symbol) || pos.instrument.includes(idx.symbol));
        const ltp = matchingIndex ? matchingIndex.ltp : pos.ltp;
        const netPnL = parseFloat(((ltp - pos.avgPrice) * pos.qty).toFixed(2));
        const costBasis = Math.abs(pos.qty * pos.avgPrice);
        const netPercent = costBasis > 0 ? parseFloat(((netPnL / costBasis) * 100).toFixed(2)) : 0;

        return {
          id: pos.id,
          ltp,
          pnl: netPnL,
          pnlPercent: netPercent,
        };
      });

      // 3. Notify subscribers
      this.subscribers.forEach((cb: TickCallback) => cb(this.currentIndices, positionUpdates));
    }, 4000);
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
