import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, RadialGradient, Stop, Line } from 'react-native-svg';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../../theme';

interface MetricArcGaugeProps {
  value?: number;
  label?: string;
  onViewPress?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const MetricArcGauge: React.FC<MetricArcGaugeProps> = ({
  value = 44553.00,
  label = 'Total Portfolio Value',
  onViewPress,
}) => {
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);

  const size = Math.min(SCREEN_WIDTH - 64, 300);
  const radius = (size - 36) / 2;
  const center = size / 2;
  const strokeWidth = 4.5;

  // Semicircle arc SVG paths
  const arcPath = `M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`;
  const outerTrackPath = `M ${center - radius - 8} ${center} A ${radius + 8} ${radius + 8} 0 0 1 ${center + radius + 8} ${center}`;
  const innerTrackPath = `M ${center - radius + 8} ${center} A ${radius - 8} ${radius - 8} 0 0 1 ${center + radius - 8} ${center}`;

  return (
    <View style={[styles.container, { width: '100%', height: size * 0.65 }]}>
      <Svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.65}`} style={styles.svg}>
        <Defs>
          {/* Vibrant Electric Royal Blue to Cyan Gradient */}
          <LinearGradient id="mainArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#1D4ED8" stopOpacity="0.95" />
            <Stop offset="30%" stopColor="#2563EB" stopOpacity="1" />
            <Stop offset="70%" stopColor="#06B6D4" stopOpacity="1" />
            <Stop offset="100%" stopColor="#38BDF8" stopOpacity="0.85" />
          </LinearGradient>

          {/* Luminous Inner Glow Fill */}
          <RadialGradient id="gaugeRadialGlow" cx="50%" cy="60%" r="55%">
            <Stop offset="0%" stopColor="#38BDF8" stopOpacity="0.30" />
            <Stop offset="50%" stopColor="#2563EB" stopOpacity="0.15" />
            <Stop offset="100%" stopColor="#1E40AF" stopOpacity="0.0" />
          </RadialGradient>

          {/* Track Gradient */}
          <LinearGradient id="trackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="rgba(37, 99, 235, 0.20)" />
            <Stop offset="50%" stopColor="rgba(6, 182, 212, 0.25)" />
            <Stop offset="100%" stopColor="rgba(37, 99, 235, 0.20)" />
          </LinearGradient>
        </Defs>

        {/* Luminous Radial Aura Background */}
        <Path
          d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center} Z`}
          fill="url(#gaugeRadialGlow)"
        />

        {/* Outer Dashed Track with Halo Glow */}
        <Path
          d={outerTrackPath}
          stroke="rgba(37, 99, 235, 0.22)"
          strokeWidth={1.5}
          strokeDasharray="4, 5"
          fill="none"
        />

        {/* Inner Subtle Accent Track */}
        <Path
          d={innerTrackPath}
          stroke="rgba(6, 182, 212, 0.20)"
          strokeWidth={1}
          fill="none"
        />

        {/* Base Background Track */}
        <Path
          d={arcPath}
          stroke="url(#trackGrad)"
          strokeWidth={strokeWidth + 2}
          fill="none"
          strokeLinecap="round"
        />

        {/* Primary Glowing Arc Stroke */}
        <Path
          d={arcPath}
          stroke="url(#mainArcGrad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />

        {/* Node 1 (Start - Left) */}
        <Circle cx={center - radius} cy={center} r={5} fill="#1D4ED8" stroke="#FFFFFF" strokeWidth={1.5} />
        <Circle cx={center - radius} cy={center} r={2} fill="#FFFFFF" />

        {/* Node 2 (45° Left) */}
        <Circle cx={center - radius * 0.707} cy={center - radius * 0.707} r={4} fill="#2563EB" stroke="#FFFFFF" strokeWidth={1.2} />

        {/* Node 3 (Center Apex - Active Glowing Pulse Ring) */}
        <Circle cx={center} cy={center - radius} r={8} fill="rgba(6, 182, 212, 0.25)" />
        <Circle cx={center} cy={center - radius} r={5.5} fill="#06B6D4" stroke="#FFFFFF" strokeWidth={1.8} />
        <Circle cx={center} cy={center - radius} r={2} fill="#FFFFFF" />

        {/* Node 4 (45° Right) */}
        <Circle cx={center + radius * 0.707} cy={center - radius * 0.707} r={4} fill="#38BDF8" stroke="#FFFFFF" strokeWidth={1.2} />

        {/* Node 5 (End - Right) */}
        <Circle cx={center + radius} cy={center} r={5} fill="#38BDF8" stroke="#FFFFFF" strokeWidth={1.5} />
        <Circle cx={center + radius} cy={center} r={2} fill="#FFFFFF" />
      </Svg>

      {/* Bottom Start/End Indicators */}
      <View style={[styles.scaleLabelsRow, { width: size, top: size * 0.52 }]}>
        <Text style={styles.scaleText}>$0</Text>
        <Text style={styles.scaleText}>Target $100k</Text>
      </View>

      {/* Centered Metric Content */}
      <View style={[styles.contentOverlay, { top: size * 0.12 }]}>
        {/* Label Badge with Glowing Icon */}
        <View style={styles.labelBadge}>
          <MaterialCommunityIcons name="shield-check" size={12} color={Colors.primary} />
          <Text style={styles.label}>{label.toUpperCase()}</Text>
        </View>

        {/* Main Value */}
        <Text style={styles.value}>{formattedValue.replace('$', '$ ')}</Text>

        {/* View Breakdown Action Button */}
        <TouchableOpacity 
          style={styles.viewBtn} 
          activeOpacity={0.8}
          onPress={onViewPress}
        >
          <Text style={styles.viewBtnText}>View Breakdown</Text>
          <Feather name="arrow-up-right" size={11} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 2,
  },
  svg: {
    position: 'absolute',
    top: 0,
  },
  scaleLabelsRow: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  scaleText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: 'rgba(37, 99, 235, 0.65)',
  },
  contentOverlay: {
    position: 'absolute',
    alignItems: 'center',
  },
  labelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.round,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.25)',
    ...Shadows.subtle,
  },
  label: {
    fontSize: 9.5,
    color: Colors.primary,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  value: {
    fontSize: 25,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.6,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 11,
    paddingVertical: 4.5,
    borderRadius: BorderRadius.round,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.35)',
    ...Shadows.subtle,
  },
  viewBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
});
