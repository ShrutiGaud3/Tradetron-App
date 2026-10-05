import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions 
} from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../../theme';
import { BacktestResult, Strategy } from '../../types';

interface BacktestReportModalProps {
  visible: boolean;
  onClose: () => void;
  result: BacktestResult | null;
  strategy: Strategy | null;
  onDeploy?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const BacktestReportModal: React.FC<BacktestReportModalProps> = ({
  visible,
  onClose,
  result,
  strategy,
  onDeploy,
}) => {
  if (!result || !strategy) return null;

  const isProfit = result.totalPnL >= 0;
  const chartWidth = SCREEN_WIDTH - 64;
  const chartHeight = 120;

  // Generate SVG Path for Equity Curve
  const minCap = Math.min(...result.equityCurve);
  const maxCap = Math.max(...result.equityCurve);
  const range = maxCap - minCap || 1;

  const points = result.equityCurve.map((val, idx) => {
    const x = (idx / (result.equityCurve.length - 1)) * chartWidth;
    const y = chartHeight - ((val - minCap) / range) * (chartHeight - 16) - 8;
    return { x, y };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="chart-bell-curve-cumulative" size={20} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.title}>Backtest Simulation Report</Text>
                <Text style={styles.subtitle}>{strategy.name} • {result.period} Historical Period</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Top Metric Highlight Banner */}
            <View style={styles.highlightBanner}>
              <View>
                <Text style={styles.pnlLabel}>Net Realized P&L</Text>
                <Text style={[styles.pnlValue, { color: isProfit ? Colors.accentGreen : Colors.accentCoral }]}>
                  {isProfit ? '+' : ''}₹{Math.abs(result.totalPnL).toLocaleString('en-IN')}
                </Text>
                <Text style={styles.pnlSubText}>
                  {isProfit ? '+' : ''}{result.pnlPercent}% on ₹{result.initialCapital.toLocaleString('en-IN')} capital
                </Text>
              </View>

              <View style={styles.winRateBox}>
                <Text style={styles.winRateLabel}>Win Rate</Text>
                <Text style={styles.winRateValue}>{result.winRate}%</Text>
                <Text style={styles.winRateSub}>{result.winningTrades}W / {result.losingTrades}L ({result.totalTrades} trades)</Text>
              </View>
            </View>

            {/* Equity Curve SVG Chart */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Equity Growth Curve</Text>
                <Text style={styles.chartTime}>Tick-by-Tick Simulation</Text>
              </View>

              <View style={styles.chartWrap}>
                <Svg width={chartWidth} height={chartHeight}>
                  <Defs>
                    <SvgLinearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0%" stopColor="#1E50DC" stopOpacity="0.35" />
                      <Stop offset="100%" stopColor="#1E50DC" stopOpacity="0.0" />
                    </SvgLinearGradient>
                  </Defs>
                  <Path d={areaD} fill="url(#equityGrad)" />
                  <Path d={pathD} stroke={Colors.primary} strokeWidth={2.5} fill="none" />
                </Svg>
              </View>
            </View>

            {/* Key Risk & Alpha Metrics Grid */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricItemLabel}>Profit Factor</Text>
                <Text style={styles.metricItemVal}>{result.profitFactor}x</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricItemLabel}>Max Drawdown</Text>
                <Text style={[styles.metricItemVal, { color: Colors.accentCoral }]}>-{result.maxDrawdown}%</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricItemLabel}>Sharpe Ratio</Text>
                <Text style={styles.metricItemVal}>{result.sharpeRatio}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricItemLabel}>Avg Trades/Mo</Text>
                <Text style={styles.metricItemVal}>{Math.round(result.totalTrades / (result.monthlyPnL.length || 1))}</Text>
              </View>
            </View>

            {/* Monthly Breakdown */}
            <View style={styles.monthlySection}>
              <Text style={styles.sectionHeading}>Monthly Performance (₹)</Text>
              <View style={styles.monthPillsRow}>
                {result.monthlyPnL.map((m) => {
                  const isMonthProfit = m.pnl >= 0;
                  return (
                    <View key={m.month} style={styles.monthPill}>
                      <Text style={styles.monthName}>{m.month}</Text>
                      <Text style={[styles.monthVal, { color: isMonthProfit ? Colors.accentGreen : Colors.accentCoral }]}>
                        {isMonthProfit ? '+' : ''}₹{(m.pnl / 1000).toFixed(1)}k
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Recent Simulated Trades Log */}
            <View style={styles.tradeLogSection}>
              <Text style={styles.sectionHeading}>Simulated Trade Executions (Latest)</Text>
              {result.recentTrades.slice(0, 5).map((t) => {
                const isTrdWin = t.pnl >= 0;
                return (
                  <View key={t.id} style={styles.tradeRow}>
                    <View style={styles.tradeLeft}>
                      <View style={[styles.tradeSidePill, { backgroundColor: t.type === 'BUY' ? 'rgba(0,186,136,0.12)' : 'rgba(255,77,106,0.12)' }]}>
                        <Text style={[styles.tradeSideText, { color: t.type === 'BUY' ? Colors.accentGreen : Colors.accentCoral }]}>
                          {t.type}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.tradeDates}>{t.entryDate}</Text>
                        <Text style={styles.tradeExitReason}>Exit: {t.exitReason}</Text>
                      </View>
                    </View>
                    <View style={styles.tradeRight}>
                      <Text style={[styles.tradePnL, { color: isTrdWin ? Colors.accentGreen : Colors.accentCoral }]}>
                        {isTrdWin ? '+' : ''}₹{t.pnl.toLocaleString('en-IN')}
                      </Text>
                      <Text style={styles.tradePercent}>
                        {isTrdWin ? '+' : ''}{t.pnlPercent}%
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={onClose}>
              <Text style={styles.secondaryBtnText}>Close Report</Text>
            </TouchableOpacity>

            {onDeploy && (
              <TouchableOpacity style={styles.primaryBtn} onPress={onDeploy}>
                <MaterialCommunityIcons name="rocket-launch-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.primaryBtnText}>Deploy This Algo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 25, 47, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '90%',
    paddingBottom: Spacing.xl,
    ...Shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30, 80, 220, 0.12)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(30, 80, 220, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  closeBtn: {
    padding: 6,
  },
  scrollBody: {
    padding: Spacing.md,
  },
  highlightBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(235, 243, 255, 0.95)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1.2,
    borderColor: 'rgba(30, 80, 220, 0.25)',
    marginBottom: Spacing.md,
  },
  pnlLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  pnlValue: {
    fontSize: 22,
    fontWeight: '800',
    marginVertical: 2,
  },
  pnlSubText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  winRateBox: {
    alignItems: 'flex-end',
  },
  winRateLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  winRateValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  winRateSub: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(30, 80, 220, 0.18)',
    marginBottom: Spacing.md,
    ...Shadows.subtle,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  chartTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  chartTime: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  chartWrap: {
    alignItems: 'center',
    overflow: 'hidden',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  metricItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(240, 246, 255, 0.8)',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(30, 80, 220, 0.14)',
  },
  metricItemLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  metricItemVal: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  monthlySection: {
    marginBottom: Spacing.md,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  monthPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  monthPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(30, 80, 220, 0.15)',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 5,
    alignItems: 'center',
    minWidth: 50,
  },
  monthName: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: '600',
  },
  monthVal: {
    fontSize: 11,
    fontWeight: '700',
  },
  tradeLogSection: {
    marginBottom: Spacing.sm,
  },
  tradeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(30, 80, 220, 0.12)',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: 6,
  },
  tradeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  tradeSidePill: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
  },
  tradeSideText: {
    fontSize: 10,
    fontWeight: '800',
  },
  tradeDates: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  tradeExitReason: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  tradeRight: {
    alignItems: 'flex-end',
  },
  tradePnL: {
    fontSize: 12,
    fontWeight: '700',
  },
  tradePercent: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  footerRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: 'rgba(10, 37, 64, 0.06)',
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  primaryBtn: {
    flex: 1.6,
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.button,
  },
  primaryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
