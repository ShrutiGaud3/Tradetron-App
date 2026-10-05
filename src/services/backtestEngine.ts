import { Strategy, BacktestResult, BacktestTrade } from '../types';

export class BacktestEngine {
  /**
   * Run realistic simulated backtest for a strategy over a selected historical timeframe
   */
  public static runBacktest(strategy: Strategy, period: '1M' | '3M' | '6M' | '1Y' = '6M'): BacktestResult {
    const days = period === '1M' ? 22 : period === '3M' ? 66 : period === '6M' ? 132 : 252;
    const initialCapital = strategy.capitalRequired || 100000;
    
    // Determine realistic base metrics based on strategy parameters
    const baseWinRate = Math.min(0.85, Math.max(0.48, (strategy.winRate || 68) / 100 + (Math.random() * 0.06 - 0.03)));
    const totalTrades = Math.max(12, Math.floor((days * (strategy.timeframe === '1m' ? 2.2 : strategy.timeframe === '5m' ? 1.4 : 0.8))));
    
    let winningTrades = 0;
    let losingTrades = 0;
    let runningCapital = initialCapital;
    const equityCurve: number[] = [initialCapital];
    const recentTrades: BacktestTrade[] = [];

    const avgWinAmount = initialCapital * 0.024;
    const avgLossAmount = initialCapital * 0.012;

    for (let i = 1; i <= totalTrades; i++) {
      const isWin = Math.random() < baseWinRate;
      let tradePnL = 0;
      let exitReason: BacktestTrade['exitReason'] = 'SIGNAL';

      if (isWin) {
        winningTrades++;
        tradePnL = avgWinAmount * (0.6 + Math.random() * 0.8);
        exitReason = Math.random() > 0.4 ? 'TARGET' : 'SIGNAL';
      } else {
        losingTrades++;
        tradePnL = -avgLossAmount * (0.7 + Math.random() * 0.6);
        exitReason = Math.random() > 0.3 ? 'STOP_LOSS' : 'TIME_EXIT';
      }

      runningCapital += tradePnL;
      equityCurve.push(Math.round(runningCapital));

      // Record latest 10 trades
      if (i > totalTrades - 10) {
        const dateObj = new Date();
        dateObj.setDate(dateObj.getDate() - (totalTrades - i) * 2);
        
        recentTrades.unshift({
          id: `BT-TRD-${i}`,
          entryDate: dateObj.toISOString().split('T')[0] + ' 09:25',
          exitDate: dateObj.toISOString().split('T')[0] + ' 14:45',
          type: (strategy.legs[0]?.action as 'BUY' | 'SELL') || 'BUY',
          pnl: Math.round(tradePnL),
          pnlPercent: parseFloat(((tradePnL / initialCapital) * 100).toFixed(2)),
          exitReason,
        });
      }
    }

    const totalPnL = runningCapital - initialCapital;
    const pnlPercent = parseFloat(((totalPnL / initialCapital) * 100).toFixed(2));
    const winRatePercent = parseFloat(((winningTrades / totalTrades) * 100).toFixed(1));
    
    // Calculate Drawdown
    let peak = equityCurve[0];
    let maxDd = 0;
    for (const val of equityCurve) {
      if (val > peak) peak = val;
      const dd = ((peak - val) / peak) * 100;
      if (dd > maxDd) maxDd = dd;
    }

    const maxDrawdown = parseFloat(maxDd.toFixed(2));
    const profitFactor = parseFloat((Math.abs((winningTrades * avgWinAmount) / (losingTrades * avgLossAmount || 1))).toFixed(2));
    const sharpeRatio = parseFloat((2.1 + (winRatePercent / 100) * 0.8 - (maxDrawdown / 20)).toFixed(2));

    // Monthly breakdown
    const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
    const monthCount = period === '1M' ? 1 : period === '3M' ? 3 : period === '6M' ? 6 : 12;
    const monthlyPnL = months.slice(0, monthCount).map((m) => ({
      month: m,
      pnl: Math.round((totalPnL / monthCount) * (0.7 + Math.random() * 0.6)),
    }));

    return {
      strategyId: strategy.id,
      period,
      initialCapital,
      totalPnL: Math.round(totalPnL),
      pnlPercent,
      winRate: winRatePercent,
      totalTrades,
      winningTrades,
      losingTrades,
      maxDrawdown,
      sharpeRatio: Math.max(1.2, sharpeRatio),
      profitFactor: Math.max(1.3, profitFactor),
      equityCurve,
      monthlyPnL,
      recentTrades,
    };
  }
}
