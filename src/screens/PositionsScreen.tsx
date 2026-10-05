import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../components/common/Header';
import { Card } from '../components/common/Card';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme';
import { useAppStore } from '../store/useAppStore';

export const PositionsScreen: React.FC = () => {
  const positions = useAppStore((state) => state.positions);
  const squareOffPosition = useAppStore((state) => state.squareOffPosition);
  const isLiveTickerActive = useAppStore((state) => state.isLiveTickerActive);
  const setOptionChainOpen = useAppStore((state) => state.setOptionChainOpen);

  const totalPositionsPnL = positions.reduce((acc, p) => acc + p.pnl, 0);
  const isOverallProfit = totalPositionsPnL >= 0;

  const handleSquareOff = (positionId: string, symbol: string) => {
    Alert.alert(
      'Square Off Position',
      `Are you sure you want to market square-off ${symbol}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Square Off', 
          style: 'destructive',
          onPress: () => squareOffPosition(positionId) 
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#DCEBFA', '#EAF2F9', '#F4F8FC']}
        style={StyleSheet.absoluteFill}
      />

      <Header title="Tradetron" subtitle="Live Positions" />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Total Positions P&L Banner Card with Live WebSocket Status */}
        <Card style={styles.pnlBannerCard} variant="blueGlass" highlighted>
          <View style={styles.pnlBannerTop}>
            <View>
              <View style={styles.liveStreamBadge}>
                <View style={[styles.pulseDot, !isLiveTickerActive && { backgroundColor: Colors.textTertiary }]} />
                <Text style={styles.liveStreamText}>
                  {isLiveTickerActive ? 'LIVE WEBSOCKET STREAM' : 'TICKER PAUSED'}
                </Text>
              </View>
              <Text style={styles.bannerTitle}>{positions.length} Active Legs Running</Text>
            </View>

            <View style={styles.pnlTotalContainer}>
              <Text style={[styles.pnlTotalValue, isOverallProfit ? styles.textProfit : styles.textLoss]}>
                {isOverallProfit ? '+' : ''}${totalPositionsPnL.toFixed(2)}
              </Text>
              <Text style={styles.pnlTotalLabel}>Net Unrealized P&L</Text>
            </View>
          </View>
        </Card>

        {/* Positions List */}
        {positions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="briefcase-check-outline" size={42} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Open Positions</Text>
            <Text style={styles.emptySubtitle}>
              Your active strategies will open positions once market entry conditions are satisfied.
            </Text>
            <TouchableOpacity 
              style={styles.openChainBtn}
              onPress={() => setOptionChainOpen(true, 'NIFTY')}
            >
              <Text style={styles.openChainBtnText}>Explore Option Chain Matrix</Text>
            </TouchableOpacity>
          </View>
        ) : (
          positions.map((pos) => {
            const isProfit = pos.pnl >= 0;
            const isSell = pos.side === 'SELL';

            return (
              <Card key={pos.id} style={styles.posCard} variant="blueGlass">
                {/* Header: Side Badge, Instrument, Strategy Tag */}
                <View style={styles.posHeader}>
                  <View style={styles.posTitleCol}>
                    <View style={styles.badgeRow}>
                      <View style={[styles.sideBadge, isSell ? styles.sideSell : styles.sideBuy]}>
                        <Text style={[styles.sideBadgeText, isSell ? styles.textSell : styles.textBuy]}>
                          {pos.side}
                        </Text>
                      </View>
                      <Text style={styles.stratTag}>{pos.strategyName}</Text>
                    </View>
                    <Text style={styles.instrumentText}>{pos.instrument}</Text>
                  </View>

                  <View style={styles.posPnlCol}>
                    <Text style={[styles.pnlValue, isProfit ? styles.textProfit : styles.textLoss]}>
                      {isProfit ? '+' : ''}${pos.pnl.toFixed(2)}
                    </Text>
                    <Text style={[styles.pnlPercent, isProfit ? styles.textProfit : styles.textLoss]}>
                      {isProfit ? '+' : ''}{pos.pnlPercent.toFixed(2)}%
                    </Text>
                  </View>
                </View>

                {/* Price Details Grid */}
                <View style={styles.priceGrid}>
                  <View style={styles.priceCol}>
                    <Text style={styles.priceLabel}>Net Qty</Text>
                    <Text style={styles.priceValue}>{pos.qty} ({Math.abs(pos.qty) / 25} Lots)</Text>
                  </View>
                  <View style={styles.priceCol}>
                    <Text style={styles.priceLabel}>Avg Fill</Text>
                    <Text style={styles.priceValue}>${pos.avgPrice.toFixed(2)}</Text>
                  </View>
                  <View style={styles.priceCol}>
                    <Text style={styles.priceLabel}>Live LTP</Text>
                    <Text style={[styles.priceValue, { color: Colors.primary }]}>${pos.ltp.toFixed(2)}</Text>
                  </View>
                </View>

                {/* Square-off / Exit Action Button */}
                <View style={styles.actionRow}>
                  <View style={styles.syncRow}>
                    <View style={styles.syncDot} />
                    <Text style={styles.statusLiveText}>Real-time Feed Active</Text>
                  </View>

                  <TouchableOpacity 
                    style={styles.squareOffBtn}
                    onPress={() => handleSquareOff(pos.id, pos.instrument)}
                  >
                    <Feather name="x-circle" size={12} color={Colors.accentCoral} />
                    <Text style={styles.squareOffText}>Square Off</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxxl * 2,
  },
  pnlBannerCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  pnlBannerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveStreamBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  pulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.accentGreen,
  },
  liveStreamText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  bannerTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  pnlTotalContainer: {
    alignItems: 'flex-end',
  },
  pnlTotalValue: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  pnlTotalLabel: {
    fontSize: 9.5,
    color: Colors.textTertiary,
    fontWeight: '600',
    marginTop: 1,
  },
  textProfit: {
    color: Colors.accentGreen,
  },
  textLoss: {
    color: Colors.accentCoral,
  },
  posCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  posHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  posTitleCol: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  sideBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  sideBuy: {
    backgroundColor: Colors.primaryLight,
  },
  sideSell: {
    backgroundColor: Colors.accentCoralLight,
  },
  sideBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
  },
  textBuy: {
    color: Colors.primary,
  },
  textSell: {
    color: Colors.accentCoral,
  },
  stratTag: {
    fontSize: 9.5,
    color: Colors.textTertiary,
    fontWeight: '600',
  },
  instrumentText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  posPnlCol: {
    alignItems: 'flex-end',
  },
  pnlValue: {
    fontSize: 14,
    fontWeight: '900',
  },
  pnlPercent: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
  priceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: BorderRadius.md,
    padding: 6,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.15)',
  },
  priceCol: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 8.5,
    color: Colors.textTertiary,
    fontWeight: '600',
    marginBottom: 1,
  },
  priceValue: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  syncDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.accentGreen,
  },
  statusLiveText: {
    fontSize: 9.5,
    color: Colors.accentGreen,
    fontWeight: '700',
  },
  squareOffBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accentCoralLight,
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: 'rgba(250, 90, 90, 0.25)',
  },
  squareOffText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.accentCoral,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
    marginBottom: 12,
  },
  openChainBtn: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.25)',
  },
  openChainBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
});
