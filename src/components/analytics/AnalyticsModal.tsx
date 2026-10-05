import React, { useState } from 'react';
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
import { useAppStore } from '../../store/useAppStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TimeframeOption = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';

const TIMEFRAMES: TimeframeOption[] = ['1D', '1W', '1M', '3M', '6M', '1Y', 'ALL'];

export const AnalyticsModal: React.FC = () => {
  const isAnalyticsOpen = useAppStore((state) => state.isAnalyticsOpen);
  const setAnalyticsOpen = useAppStore((state) => state.setAnalyticsOpen);
  const portfolio = useAppStore((state) => state.portfolio);
  const strategies = useAppStore((state) => state.strategies);
  const deployments = useAppStore((state) => state.deployments);

  const [timeframe, setTimeframe] = useState<TimeframeOption>('6M');

  if (!isAnalyticsOpen) return null;

  const chartWidth = SCREEN_WIDTH - 64;
  const chartHeight = 120;

  // Mock Equity points based on timeframe
  const equityPoints = [
    32000, 32800, 31900, 33500, 34200, 33800, 35400, 36800, 
    36200, 38100, 39500, 41200, 40800, 42900, 44553
  ];

  const minVal = Math.min(...equityPoints);
  const maxVal = Math.max(...equityPoints);
  const valRange = maxVal - minVal || 1;

  const points = equityPoints.map((val, idx) => {
    const x = (idx / (equityPoints.length - 1)) * chartWidth;
    const y = chartHeight - ((val - minVal) / valRange) * (chartHeight - 18) - 8;
    return { x, y };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

  // Drawdown points
  const drawdownPoints = [0, 0, -2.7, 0, 0, -1.2, 0, 0, -1.6, 0, 0, 0, -0.9, 0, 0];
  const ddPoints = drawdownPoints.map((val, idx) => {
    const x = (idx / (drawdownPoints.length - 1)) * chartWidth;
    const y = ((Math.abs(val)) / 3.0) * (50 - 10) + 5;
    return { x, y };
  });

  const ddPathD = ddPoints.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const ddAreaD = `${ddPathD} L ${chartWidth} 0 L 0 0 Z`;

  const monthlyMatrix = [
    { month: 'Oct 25', ret: '+6.8%', pnl: '₹14.2k', positive: true },
    { month: 'Nov 25', ret: '+4.2%', pnl: '₹9.8k', positive: true },
    { month: 'Dec 25', ret: '-1.4%', pnl: '-₹3.2k', positive: false },
    { month: 'Jan 26', ret: '+8.1%', pnl: '₹18.4k', positive: true },
    { month: 'Feb 26', ret: '+5.5%', pnl: '₹12.6k', positive: true },
    { month: 'Mar 26', ret: '+9.3%', pnl: '₹21.5k', positive: true },
  ];

  return (
    <Modal visible={isAnalyticsOpen} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="finance" size={20} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.title}>Portfolio Risk & Alpha Telemetry</Text>
                <Text style={styles.subtitle}>Institutional Quantitative Analytics</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setAnalyticsOpen(false)} style={styles.closeBtn}>
              <Feather name="x" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Timeframe Bar */}
          <View style={styles.timeframeBar}>
            {TIMEFRAMES.map((tf) => (
              <TouchableOpacity
                key={tf}
                style={[styles.tfBtn, timeframe === tf && styles.tfBtnActive]}
                onPress={() => setTimeframe(tf)}
              >
                <Text style={[styles.tfBtnText, timeframe === tf && styles.tfBtnTextActive]}>
                  {tf}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Top Metric Highlight */}
            <View style={styles.heroCard}>
              <View style={styles.heroTop}>
                <View>
                  <Text style={styles.heroLabel}>Net Cumulative P&L</Text>
                  <Text style={styles.heroPnL}>+₹{portfolio.overallPnL.toLocaleString('en-IN')}</Text>
                  <Text style={styles.heroSubText}>+28.4% return on capital deployed</Text>
                </View>

                <View style={styles.heroRight}>
                  <View style={styles.alphaBadge}>
                    <MaterialCommunityIcons name="trending-up" size={14} color={Colors.accentGreen} />
                    <Text style={styles.alphaBadgeText}>Alpha: +14.2% vs NIFTY</Text>
                  </View>
                  <Text style={styles.winRateTxt}>Win Rate: 74.2%</Text>
                </View>
              </View>

              {/* Equity Growth SVG Curve */}
              <View style={styles.chartWrap}>
                <Svg width={chartWidth} height={chartHeight}>
                  <Defs>
                    <SvgLinearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0%" stopColor="#2563EB" stopOpacity="0.35" />
                      <Stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                    </SvgLinearGradient>
                  </Defs>
                  <Path d={areaD} fill="url(#portfolioGrad)" />
                  <Path d={pathD} stroke={Colors.primary} strokeWidth={2.5} fill="none" />
                </Svg>
              </View>
            </View>

            {/* Underwater Drawdown Chart */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTitle}>Drawdown Depth (Underwater)</Text>
                  <Text style={styles.cardSub}>Max Drawdown: -2.7% (SEBI Limit: 15%)</Text>
                </View>
                <View style={styles.ddPill}>
                  <Text style={styles.ddPillText}>Safe Zone</Text>
                </View>
              </View>

              <View style={styles.chartWrap}>
                <Svg width={chartWidth} height={50}>
                  <Defs>
                    <SvgLinearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0%" stopColor="#FA5A5A" stopOpacity="0.30" />
                      <Stop offset="100%" stopColor="#FA5A5A" stopOpacity="0.0" />
                    </SvgLinearGradient>
                  </Defs>
                  <Path d={ddAreaD} fill="url(#ddGrad)" />
                  <Path d={ddPathD} stroke={Colors.accentCoral} strokeWidth={1.8} fill="none" />
                </Svg>
              </View>
            </View>

            {/* Institutional Ratios Matrix */}
            <Text style={styles.sectionHeading}>Quantitative Risk Ratios</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Sharpe Ratio</Text>
                <Text style={styles.metricVal}>2.45</Text>
                <Text style={styles.metricSub}>Top 5% Quant tier</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Sortino Ratio</Text>
                <Text style={styles.metricVal}>3.12</Text>
                <Text style={styles.metricSub}>Low downside dev</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Profit Factor</Text>
                <Text style={styles.metricVal}>2.18x</Text>
                <Text style={styles.metricSub}>Gross Win/Gross Loss</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Gain-to-Pain</Text>
                <Text style={styles.metricVal}>{portfolio.gainToPainRatio || '1.84'}</Text>
                <Text style={styles.metricSub}>Institutional Grade</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Avg Win Trade</Text>
                <Text style={[styles.metricVal, { color: Colors.accentGreen }]}>+₹2,840</Text>
                <Text style={styles.metricSub}>Per lot sizing</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Avg Loss Trade</Text>
                <Text style={[styles.metricVal, { color: Colors.accentCoral }]}>-₹1,120</Text>
                <Text style={styles.metricSub}>Risk:Reward 1:2.5</Text>
              </View>
            </View>

            {/* Strategy Alpha Contribution */}
            <Text style={styles.sectionHeading}>Algo Performance Contribution</Text>
            <View style={styles.stratList}>
              {deployments.map((dep) => {
                const isWin = dep.todayPnL >= 0;
                return (
                  <View key={dep.id} style={styles.stratRow}>
                    <View style={styles.stratLeft}>
                      <View style={[styles.stratDot, { backgroundColor: isWin ? Colors.accentGreen : Colors.accentCoral }]} />
                      <View>
                        <Text style={styles.stratName}>{dep.strategyName}</Text>
                        <Text style={styles.stratMeta}>{dep.brokerName} • {dep.multiplier}x Multiplier</Text>
                      </View>
                    </View>
                    <View style={styles.stratRight}>
                      <Text style={[styles.stratPnL, { color: isWin ? Colors.accentGreen : Colors.accentCoral }]}>
                        {isWin ? '+' : ''}₹{dep.todayPnL.toFixed(2)}
                      </Text>
                      <Text style={styles.stratReturn}>Overall: ₹{dep.overallPnL.toLocaleString('en-IN')}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Monthly Calendar Performance Matrix */}
            <Text style={styles.sectionHeading}>Monthly Return Heatmap (FY 25-26)</Text>
            <View style={styles.monthlyGrid}>
              {monthlyMatrix.map((m) => (
                <View key={m.month} style={[styles.monthCard, m.positive ? styles.monthPositive : styles.monthNegative]}>
                  <Text style={styles.monthLabel}>{m.month}</Text>
                  <Text style={[styles.monthRet, { color: m.positive ? Colors.accentGreen : Colors.accentCoral }]}>
                    {m.ret}
                  </Text>
                  <Text style={styles.monthPnl}>{m.pnl}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setAnalyticsOpen(false)}>
              <Text style={styles.closeModalBtnText}>Close Telemetry</Text>
            </TouchableOpacity>
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
    maxHeight: '92%',
    paddingBottom: Spacing.lg,
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
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  closeBtn: {
    padding: 6,
  },
  timeframeBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(240, 246, 255, 0.85)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30, 80, 220, 0.1)',
    gap: 4,
  },
  tfBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  tfBtnActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(30, 80, 220, 0.25)',
    ...Shadows.subtle,
  },
  tfBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tfBtnTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  scrollBody: {
    padding: Spacing.md,
  },
  heroCard: {
    backgroundColor: 'rgba(235, 243, 255, 0.95)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1.2,
    borderColor: 'rgba(30, 80, 220, 0.25)',
    marginBottom: Spacing.md,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  heroLabel: {
    fontSize: 10.5,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  heroPnL: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.accentGreen,
    marginVertical: 2,
  },
  heroSubText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  heroRight: {
    alignItems: 'flex-end',
  },
  alphaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.round,
    marginBottom: 4,
  },
  alphaBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.accentGreen,
  },
  winRateTxt: {
    fontSize: 10.5,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  chartWrap: {
    alignItems: 'center',
    overflow: 'hidden',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(30, 80, 220, 0.18)',
    marginBottom: Spacing.md,
    ...Shadows.subtle,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cardSub: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  ddPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.round,
  },
  ddPillText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: Colors.accentGreen,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.xs,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  metricCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: 'rgba(240, 246, 255, 0.85)',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(30, 80, 220, 0.15)',
  },
  metricLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  metricVal: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginVertical: 2,
  },
  metricSub: {
    fontSize: 9,
    color: Colors.textTertiary,
  },
  stratList: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(30, 80, 220, 0.15)',
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  stratRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30, 80, 220, 0.08)',
  },
  stratLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stratDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stratName: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  stratMeta: {
    fontSize: 9.5,
    color: Colors.textTertiary,
  },
  stratRight: {
    alignItems: 'flex-end',
  },
  stratPnL: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  stratReturn: {
    fontSize: 9.5,
    color: Colors.textTertiary,
  },
  monthlyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.md,
  },
  monthCard: {
    flex: 1,
    minWidth: '30%',
    padding: 8,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  monthPositive: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  monthNegative: {
    backgroundColor: 'rgba(250, 90, 90, 0.08)',
    borderColor: 'rgba(250, 90, 90, 0.25)',
  },
  monthLabel: {
    fontSize: 9.5,
    color: Colors.textTertiary,
    fontWeight: '600',
  },
  monthRet: {
    fontSize: 12,
    fontWeight: '800',
    marginVertical: 2,
  },
  monthPnl: {
    fontSize: 9,
    color: Colors.textSecondary,
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
  },
  closeModalBtn: {
    backgroundColor: Colors.textPrimary,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeModalBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
