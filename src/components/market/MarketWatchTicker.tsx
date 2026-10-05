import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../../theme';
import { useAppStore } from '../../store/useAppStore';

export const MarketWatchTicker: React.FC = () => {
  const indices = useAppStore((state) => state.indices);
  const isLiveTickerActive = useAppStore((state) => state.isLiveTickerActive);
  const toggleLiveTicker = useAppStore((state) => state.toggleLiveTicker);
  const setOptionChainOpen = useAppStore((state) => state.setOptionChainOpen);

  return (
    <View style={styles.container}>
      {/* Stream Controls & Pulse */}
      <View style={styles.headerControlRow}>
        <View style={styles.liveStatusRow}>
          <View style={[styles.pulseCircle, !isLiveTickerActive && styles.pulseInactive]} />
          <Text style={styles.liveStatusText}>
            {isLiveTickerActive ? 'LIVE STREAMING' : 'STREAM PAUSED'}
          </Text>
        </View>

        <View style={styles.rightActions}>
          <TouchableOpacity 
            style={styles.optionChainBtn}
            onPress={() => setOptionChainOpen(true, 'NIFTY')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="table-split-cell" size={13} color={Colors.primary} />
            <Text style={styles.optionChainBtnText}>Option Chain</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.toggleBtn}
            onPress={toggleLiveTicker}
            activeOpacity={0.7}
          >
            <Feather 
              name={isLiveTickerActive ? 'pause' : 'play'} 
              size={11} 
              color={isLiveTickerActive ? Colors.accentAmber : Colors.accentGreen} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Horizontal Indices Quotes Strip */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.indicesScroll}
      >
        {indices.map((idx) => {
          const isUp = idx.change >= 0;
          return (
            <TouchableOpacity 
              key={idx.symbol} 
              style={styles.indexCard}
              onPress={() => setOptionChainOpen(true, idx.symbol.includes('BANK') ? 'BANKNIFTY' : 'NIFTY')}
              activeOpacity={0.75}
            >
              <View style={styles.indexTopRow}>
                <Text style={styles.indexSymbol}>{idx.symbol}</Text>
                <Text style={[styles.percentBadge, isUp ? styles.textUp : styles.textDown]}>
                  {isUp ? '+' : ''}{idx.changePercent}%
                </Text>
              </View>

              <View style={styles.indexBottomRow}>
                <Text style={styles.indexLtp}>{idx.ltp.toLocaleString()}</Text>
                <Text style={[styles.indexChange, isUp ? styles.textUp : styles.textDown]}>
                  {isUp ? '+' : ''}{idx.change}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginBottom: 8,
  },
  headerControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
    paddingHorizontal: 2,
  },
  liveStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  pulseCircle: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accentGreen,
  },
  pulseInactive: {
    backgroundColor: Colors.textTertiary,
  },
  liveStatusText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  optionChainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.25)',
  },
  optionChainBtnText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: Colors.primary,
  },
  toggleBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.20)',
  },
  indicesScroll: {
    gap: 6,
  },
  indexCard: {
    backgroundColor: 'rgba(219, 234, 254, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.25)',
    minWidth: 110,
    ...Shadows.subtle,
  },
  indexTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  indexSymbol: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  percentBadge: {
    fontSize: 8.5,
    fontWeight: '800',
  },
  indexBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  indexLtp: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  indexChange: {
    fontSize: 9,
    fontWeight: '700',
  },
  textUp: {
    color: Colors.accentGreen,
  },
  textDown: {
    color: Colors.accentCoral,
  },
});
