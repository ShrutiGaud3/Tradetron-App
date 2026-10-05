import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../components/common/Header';
import { Card } from '../components/common/Card';
import { MetricArcGauge } from '../components/common/MetricArcGauge';
import { PillBadge } from '../components/common/PillBadge';
import { CandleChart } from '../components/common/CandleChart';
import { AiAssistantCard } from '../components/common/AiAssistantCard';
import { MarketWatchTicker } from '../components/market/MarketWatchTicker';
import { OptionChainModal } from '../components/market/OptionChainModal';
import { DeploymentDetailsModal } from '../components/deployment/DeploymentDetailsModal';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { marketDataService } from '../services/marketDataService';
import { Deployment } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const DashboardScreen: React.FC = () => {
  const portfolio = useAppStore((state) => state.portfolio);
  const deployments = useAppStore((state) => state.deployments);
  const pauseDeployment = useAppStore((state) => state.pauseDeployment);
  const resumeDeployment = useAppStore((state) => state.resumeDeployment);
  const isKillSwitchActive = useAppStore((state) => state.isKillSwitchActive);
  const applyMarketTick = useAppStore((state) => state.applyMarketTick);
  const isLiveTickerActive = useAppStore((state) => state.isLiveTickerActive);
  const setAnalyticsOpen = useAppStore((state) => state.setAnalyticsOpen);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedDepDetails, setSelectedDepDetails] = useState<Deployment | null>(null);
  const [isDepDetailsOpen, setIsDepDetailsOpen] = useState(false);

  const handleOpenDeploymentDetails = (dep: Deployment) => {
    setSelectedDepDetails(dep);
    setIsDepDetailsOpen(true);
  };

  // Subscribe to live WebSocket tick updates
  useEffect(() => {
    if (isLiveTickerActive && !marketDataService.getStatus()) {
      marketDataService.start(() => useAppStore.getState().positions);
    }

    const unsubscribe = marketDataService.subscribe((indices, posUpdates) => {
      applyMarketTick(indices, posUpdates);
    });

    return () => {
      unsubscribe();
    };
  }, [isLiveTickerActive]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <View style={styles.screen}>
      {/* Background Decorative Ambient Blue Aura */}
      <LinearGradient
        colors={['#DCEBFA', '#EAF2F9', '#F4F8FC']}
        style={StyleSheet.absoluteFill}
      />

      <Header title="Dashboard" subtitle="My Portfolio" />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Module 3: Live Market Watch Streaming Ticker Bar */}
        <MarketWatchTicker />

        {/* Emergency Kill Switch Banner if active */}
        {isKillSwitchActive && (
          <View style={styles.emergencyBanner}>
            <MaterialCommunityIcons name="alert-octagon" size={18} color="#FFFFFF" />
            <Text style={styles.emergencyBannerText}>
              EMERGENCY KILL SWITCH ACTIVE — All orders blocked & strategies paused
            </Text>
          </View>
        )}

        {/* HERO CARD: My Portfolio with TRANSPARENT BLUE TINT */}
        <Card style={styles.heroCard} variant="blueGlass" highlighted>
          {/* Top Pill Badges with Compact Modern Textures */}
          <View style={styles.pillRow}>
            <PillBadge 
              label="Stock" 
              value={`$${portfolio.stockPortfolio.toFixed(0)}`} 
              variant="coral" 
            />
            <PillBadge 
              label="Crypto" 
              value={`$${portfolio.cryptoPortfolio.toFixed(0)}`} 
              variant="amber" 
            />
            <PillBadge 
              label="Algo" 
              value={`$${portfolio.algoPortfolio.toFixed(0)}`} 
              variant="blue" 
            />
          </View>

          {/* High-Definition Semicircle Portfolio Value Arc Gauge */}
          <MetricArcGauge value={portfolio.totalValue} />

          {/* Quick PnL Footer with Frosted Translucent Blue Glass */}
          <TouchableOpacity 
            style={styles.heroFooter}
            onPress={() => setAnalyticsOpen(true)}
            activeOpacity={0.8}
          >
            <View style={styles.footerCol}>
              <Text style={styles.footerLabel}>Today's P&L</Text>
              <Text style={[styles.footerValue, { color: Colors.accentGreen }]}>
                +₹{portfolio.todayPnL.toFixed(2)} (+3.2%)
              </Text>
            </View>

            <View style={styles.dividerVertical} />

            <View style={styles.footerCol}>
              <Text style={styles.footerLabel}>Overall Realized</Text>
              <Text style={[styles.footerValue, { color: Colors.primary }]}>
                +₹{portfolio.overallPnL.toFixed(2)}
              </Text>
            </View>

            <View style={styles.dividerVertical} />

            <View style={styles.telemetryIconWrap}>
              <MaterialCommunityIcons name="chart-box-outline" size={16} color={Colors.primary} />
              <Text style={styles.telemetryText}>Telemetry</Text>
            </View>
          </TouchableOpacity>
        </Card>

        {/* STRATEGY GRAPH: In Transparent Blue Glass Tint */}
        <CandleChart 
          gainToPain={portfolio.gainToPainRatio}
          rewardToRisk={portfolio.rewardToRiskRatio}
          leverageUsed={portfolio.leverageUsed}
        />

        {/* Algo AI Copilot Assistant Widget */}
        <View style={styles.sectionSpacer}>
          <AiAssistantCard />
        </View>

        {/* Active Deployments Section */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Active Deployments</Text>
            <Text style={styles.sectionSubtitle}>
              {deployments.length} strategies running in live/paper mode
            </Text>
          </View>
          <TouchableOpacity style={styles.seeAllBtn}>
            <Text style={styles.seeAllText}>Manage All</Text>
            <Feather name="chevron-right" size={12} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {deployments.map((dep) => {
          const isProfit = dep.todayPnL >= 0;
          return (
            <TouchableOpacity 
              key={dep.id} 
              activeOpacity={0.85}
              onPress={() => handleOpenDeploymentDetails(dep)}
            >
              <Card style={styles.deploymentCard} variant="blueGlass">
                <View style={styles.depTopRow}>
                  <View style={styles.depTitleCol}>
                    <View style={styles.depBadgeRow}>
                      <View style={[
                        styles.modeBadge, 
                        dep.mode === 'LIVE' ? styles.liveBadge : styles.paperBadge
                      ]}>
                        <Text style={[
                          styles.modeBadgeText,
                          dep.mode === 'LIVE' ? styles.liveBadgeText : styles.paperBadgeText
                        ]}>
                          ● {dep.mode}
                        </Text>
                      </View>
                      <Text style={styles.brokerLabel}>{dep.brokerName}</Text>
                    </View>
                    <Text style={styles.depStrategyName}>{dep.strategyName}</Text>
                  </View>

                  {/* P&L Column */}
                  <View style={styles.depPnlCol}>
                    <Text style={[styles.depPnlText, isProfit ? styles.pnlProfit : styles.pnlLoss]}>
                      {isProfit ? '+' : ''}₹{dep.todayPnL.toFixed(2)}
                    </Text>
                    <Text style={[styles.depPnlSub, isProfit ? styles.pnlProfit : styles.pnlLoss]}>
                      {isProfit ? '+' : ''}{dep.todayPnLPercent.toFixed(2)}%
                    </Text>
                  </View>
                </View>

                {/* Status & Signal Ticker */}
                <View style={styles.signalBox}>
                  <View style={[
                    styles.statusDot, 
                    dep.status === 'ACTIVE' ? styles.dotActive : styles.dotPaused
                  ]} />
                  <Text style={styles.signalText} numberOfLines={1}>
                    {dep.lastSignal || 'Monitoring conditions...'}
                  </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.depActionsRow}>
                  <Text style={styles.legsCountText}>
                    {dep.activeLegsCount} Active Legs • {dep.multiplier}x Multiplier
                  </Text>

                  <View style={styles.depBtnGroup}>
                    {dep.status === 'ACTIVE' ? (
                      <TouchableOpacity 
                        style={styles.pauseBtn}
                        onPress={(e) => {
                          e.stopPropagation?.();
                          pauseDeployment(dep.id);
                        }}
                      >
                        <Feather name="pause" size={11} color={Colors.accentAmber} />
                        <Text style={styles.pauseBtnText}>Pause</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity 
                        style={styles.resumeBtn}
                        onPress={(e) => {
                          e.stopPropagation?.();
                          resumeDeployment(dep.id);
                        }}
                      >
                        <Feather name="play" size={11} color={Colors.accentGreen} />
                        <Text style={styles.resumeBtnText}>Resume</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Module 3: Live Option Chain Modal Sheet */}
      <OptionChainModal />

      {/* Module 5: Live Deployment Telemetry & Control Modal */}
      <DeploymentDetailsModal
        visible={isDepDetailsOpen}
        deployment={selectedDepDetails}
        onClose={() => setIsDepDetailsOpen(false)}
      />
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
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.accentCoral,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    ...Shadows.card,
  },
  emergencyBannerText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroCard: {
    marginBottom: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  pillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(37, 99, 235, 0.22)',
    paddingTop: 8,
    marginTop: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: BorderRadius.md,
    paddingBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.15)',
  },
  footerCol: {
    alignItems: 'center',
  },
  telemetryIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  telemetryText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 1,
  },
  footerLabel: {
    fontSize: 9.5,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 1,
  },
  footerValue: {
    fontSize: 13.5,
    fontWeight: '900',
  },
  dividerVertical: {
    width: 1,
    height: 22,
    backgroundColor: 'rgba(37, 99, 235, 0.22)',
  },
  sectionSpacer: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.25)',
  },
  seeAllText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  deploymentCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  depTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  depTitleCol: {
    flex: 1,
  },
  depBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  modeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: BorderRadius.round,
  },
  liveBadge: {
    backgroundColor: Colors.accentGreenLight,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  paperBadge: {
    backgroundColor: Colors.accentPurpleLight,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  modeBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
  },
  liveBadgeText: {
    color: Colors.accentGreen,
  },
  paperBadgeText: {
    color: Colors.accentPurple,
  },
  brokerLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: '600',
  },
  depStrategyName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  depPnlCol: {
    alignItems: 'flex-end',
  },
  depPnlText: {
    fontSize: 14,
    fontWeight: '900',
  },
  depPnlSub: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
  pnlProfit: {
    color: Colors.accentGreen,
  },
  pnlLoss: {
    color: Colors.accentCoral,
  },
  signalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.70)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.20)',
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  dotActive: {
    backgroundColor: Colors.accentGreen,
  },
  dotPaused: {
    backgroundColor: Colors.accentAmber,
  },
  signalText: {
    flex: 1,
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  depActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  legsCountText: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: '600',
  },
  depBtnGroup: {
    flexDirection: 'row',
    gap: 5,
  },
  pauseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.accentAmberLight,
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  pauseBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.accentAmber,
  },
  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.accentGreenLight,
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  resumeBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.accentGreen,
  },
});
