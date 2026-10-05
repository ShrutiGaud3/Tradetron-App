import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Rect, Line, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../../theme';
import { mockCandles } from '../../data/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CandleChartProps {
  gainToPain?: number;
  rewardToRisk?: number;
  leverageUsed?: number;
}

export const CandleChart: React.FC<CandleChartProps> = ({
  gainToPain = 1.8,
  rewardToRisk = 2.4,
  leverageUsed = 120000,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'Day' | 'Week' | 'Month' | 'Year'>('Month');
  const [chartType, setChartType] = useState<'candle' | 'line'>('candle');

  const chartWidth = SCREEN_WIDTH - 84;
  const chartHeight = 155;
  const candleCount = mockCandles.length;
  const candleSlotWidth = chartWidth / candleCount;
  const candleBarWidth = Math.max(7, candleSlotWidth * 0.45);

  const minPrice = 74.3200;
  const maxPrice = 74.3400;
  const priceRange = maxPrice - minPrice;

  const getY = (val: number) => {
    return chartHeight - ((val - minPrice) / priceRange) * chartHeight;
  };

  return (
    <View style={styles.outerWrapper}>
      <LinearGradient
        colors={[
          'rgba(205, 228, 255, 0.72)', 
          'rgba(170, 210, 255, 0.52)', 
          'rgba(215, 238, 255, 0.68)'
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        {/* Chart Top Header */}
        <View style={styles.headerRow}>
          <View style={styles.titleWithIcon}>
            <View style={styles.iconBadge}>
              <MaterialCommunityIcons name="chart-box-outline" size={16} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Strategy Graph</Text>
              <Text style={styles.headerSub}>Live Candle & Volatility Metrics</Text>
            </View>
          </View>

          <View style={styles.headerControls}>
            <TouchableOpacity style={styles.iconBtn}>
              <MaterialCommunityIcons name="tune-variant" size={14} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Feather name="arrow-up-right" size={13} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Chart Area */}
        <View style={styles.chartBody}>
          {/* Y-Axis scale */}
          <View style={styles.yAxis}>
            <Text style={styles.axisText}>74.3230</Text>
            <Text style={styles.axisText}>74.3325</Text>
            <Text style={styles.axisText}>74.3320</Text>
            <Text style={styles.axisText}>74.3215</Text>
            <Text style={styles.axisText}>74.3210</Text>
          </View>

          {/* SVG Candles */}
          <View style={styles.svgWrapper}>
            <Svg width={chartWidth} height={chartHeight}>
              <Defs>
                <SvgLinearGradient id="chartGridGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="#2563EB" stopOpacity="0.12" />
                  <Stop offset="100%" stopColor="#3B82F6" stopOpacity="0.03" />
                </SvgLinearGradient>
              </Defs>

              {/* Translucent Blue Grid Backdrop */}
              <Rect x="0" y="0" width={chartWidth} height={chartHeight} fill="url(#chartGridGrad)" rx={8} />

              {/* Gridlines */}
              <Line x1="0" y1={chartHeight * 0.25} x2={chartWidth} y2={chartHeight * 0.25} stroke="rgba(37, 99, 235, 0.20)" strokeDasharray="3, 4" strokeWidth="1" />
              <Line x1="0" y1={chartHeight * 0.5} x2={chartWidth} y2={chartHeight * 0.5} stroke="rgba(37, 99, 235, 0.20)" strokeDasharray="3, 4" strokeWidth="1" />
              <Line x1="0" y1={chartHeight * 0.75} x2={chartWidth} y2={chartHeight * 0.75} stroke="rgba(37, 99, 235, 0.20)" strokeDasharray="3, 4" strokeWidth="1" />

              {/* Candlesticks */}
              {mockCandles.map((c, index) => {
                const x = index * candleSlotWidth + candleSlotWidth / 2;
                const highY = getY(c.high);
                const lowY = getY(c.low);
                const openY = getY(c.open);
                const closeY = getY(c.close);
                const candleTop = Math.min(openY, closeY);
                const candleHeight = Math.max(3, Math.abs(openY - closeY));
                const color = c.isBullish ? Colors.accentGreen : Colors.accentCoral;

                return (
                  <React.Fragment key={index}>
                    {/* High/Low Wick */}
                    <Line
                      x1={x}
                      y1={highY}
                      x2={x}
                      y2={lowY}
                      stroke={color}
                      strokeWidth="1.5"
                    />
                    {/* Candle Body */}
                    <Rect
                      x={x - candleBarWidth / 2}
                      y={candleTop}
                      width={candleBarWidth}
                      height={candleHeight}
                      fill={color}
                      rx={2.5}
                    />
                  </React.Fragment>
                );
              })}
            </Svg>

            {/* Floating Price Tooltip */}
            <View style={styles.tooltipPill}>
              <Text style={styles.tooltipDate}>Nov 12, 2026</Text>
              <Text style={styles.tooltipPrice}>$1,250</Text>
            </View>
          </View>
        </View>

        {/* X-Axis months */}
        <View style={styles.xAxis}>
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((m) => (
            <Text key={m} style={styles.xAxisText}>{m}</Text>
          ))}
        </View>

        {/* Timeframe Controls Bar */}
        <View style={styles.bottomControls}>
          <View style={styles.typeToggles}>
            <TouchableOpacity 
              style={[styles.typeBtn, chartType === 'line' && styles.typeBtnActive]}
              onPress={() => setChartType('line')}
            >
              <MaterialCommunityIcons name="chart-timeline-variant" size={15} color={chartType === 'line' ? Colors.primary : Colors.textTertiary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.typeBtn, chartType === 'candle' && styles.typeBtnActive]}
              onPress={() => setChartType('candle')}
            >
              <MaterialCommunityIcons name="chart-bar" size={15} color={chartType === 'candle' ? Colors.primary : Colors.textTertiary} />
            </TouchableOpacity>
          </View>

          <View style={styles.timeframePills}>
            {(['Year', 'Month', 'Week', 'Day'] as const).map((tf) => (
              <TouchableOpacity
                key={tf}
                style={[styles.tfBtn, selectedTimeframe === tf && styles.tfBtnActive]}
                onPress={() => setSelectedTimeframe(tf)}
              >
                <Text style={[styles.tfBtnText, selectedTimeframe === tf && styles.tfBtnTextActive]}>
                  {tf}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Metrics Row with Translucent Blue Tint Box */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Gain to pain ratio</Text>
            <Text style={[styles.statValue, { color: Colors.primary }]}>{gainToPain}</Text>
          </View>
          <View style={styles.statBoxDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Reward to risk</Text>
            <Text style={[styles.statValue, { color: Colors.accentGreen }]}>{rewardToRisk}</Text>
          </View>
          <View style={styles.statBoxDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Leverage used</Text>
            <Text style={styles.statValue}>${leverageUsed.toLocaleString()}</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(37, 99, 235, 0.35)',
    overflow: 'hidden',
    backgroundColor: 'rgba(195, 222, 255, 0.35)',
    ...Shadows.glassCard,
  },
  gradientContainer: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    padding: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.80)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.25)',
  },
  headerTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerSub: {
    fontSize: 9.5,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  headerControls: {
    flexDirection: 'row',
    gap: 6,
  },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.80)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.25)',
  },
  chartBody: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    marginTop: Spacing.xs,
  },
  yAxis: {
    width: 48,
    height: 155,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  axisText: {
    fontSize: 8.5,
    color: Colors.textTertiary,
    fontWeight: '600',
  },
  svgWrapper: {
    flex: 1,
    height: 155,
    position: 'relative',
  },
  tooltipPill: {
    position: 'absolute',
    top: 42,
    left: '52%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderGlassGlow,
    alignItems: 'center',
    ...Shadows.blueGlow,
  },
  tooltipDate: {
    fontSize: 8.5,
    color: Colors.textTertiary,
    fontWeight: '600',
  },
  tooltipPrice: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.primary,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: 48,
    marginTop: 4,
  },
  xAxisText: {
    fontSize: 9.5,
    color: Colors.textTertiary,
    fontWeight: '600',
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(37, 99, 235, 0.18)',
  },
  typeToggles: {
    flexDirection: 'row',
    gap: 6,
  },
  typeBtn: {
    padding: 5,
    borderRadius: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.22)',
  },
  typeBtnActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: 'rgba(37, 99, 235, 0.45)',
  },
  timeframePills: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: BorderRadius.round,
    padding: 2.5,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.25)',
  },
  tfBtn: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: BorderRadius.round,
  },
  tfBtnActive: {
    backgroundColor: '#FFFFFF',
    ...Shadows.subtle,
  },
  tfBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  tfBtnTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.70)',
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.20)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statBoxDivider: {
    width: 1,
    height: '75%',
    backgroundColor: 'rgba(37, 99, 235, 0.20)',
    alignSelf: 'center',
  },
  statLabel: {
    fontSize: 8.5,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 1,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
});
