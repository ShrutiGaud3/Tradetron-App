import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Dimensions,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../components/common/Header';
import { Card } from '../components/common/Card';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { Strategy, BacktestResult } from '../types';
import { BacktestReportModal } from '../components/strategy/BacktestReportModal';
import { BacktestEngine } from '../services/backtestEngine';
import { PublishStrategyModal } from '../components/marketplace/PublishStrategyModal';
import { CreatorStudioModal } from '../components/marketplace/CreatorStudioModal';
import { SocialLeaderboardModal } from '../components/marketplace/SocialLeaderboardModal';
import { StrategyReviewsModal } from '../components/marketplace/StrategyReviewsModal';
import { SubscriptionCheckoutModal } from '../components/marketplace/SubscriptionCheckoutModal';

interface StrategiesScreenProps {
  onSelectStrategy?: (strategy: Strategy) => void;
  onOpenDeploy?: (strategy: Strategy) => void;
  onOpenBuilder?: () => void;
}

export const StrategiesScreen: React.FC<StrategiesScreenProps> = ({ 
  onSelectStrategy,
  onOpenDeploy,
  onOpenBuilder,
}) => {
  const strategies = useAppStore((state) => state.strategies);
  const reviews = useAppStore((state) => state.reviews);
  const isPublishModalOpen = useAppStore((state) => state.isPublishModalOpen);
  const setPublishModalOpen = useAppStore((state) => state.setPublishModalOpen);
  const isCreatorStudioOpen = useAppStore((state) => state.isCreatorStudioOpen);
  const setCreatorStudioOpen = useAppStore((state) => state.setCreatorStudioOpen);
  const isLeaderboardOpen = useAppStore((state) => state.isLeaderboardOpen);
  const setLeaderboardOpen = useAppStore((state) => state.setLeaderboardOpen);
  const isReviewsModalOpen = useAppStore((state) => state.isReviewsModalOpen);
  const setReviewsModalOpen = useAppStore((state) => state.setReviewsModalOpen);
  const selectedStrategyForReviews = useAppStore((state) => state.selectedStrategyForReviews);
  const isCheckoutModalOpen = useAppStore((state) => state.isCheckoutModalOpen);
  const setCheckoutModalOpen = useAppStore((state) => state.setCheckoutModalOpen);
  const selectedStrategyForCheckout = useAppStore((state) => state.selectedStrategyForCheckout);

  const [activeTab, setActiveTab] = useState<'Marketplace' | 'Subscribed' | 'My Algos'>('Marketplace');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedStratId, setExpandedStratId] = useState<string | null>(null);
  const [selectedForBacktest, setSelectedForBacktest] = useState<Strategy | null>(null);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [backtestModalVisible, setBacktestModalVisible] = useState(false);

  const handleOpenBacktest = (strategy: Strategy) => {
    const result = BacktestEngine.runBacktest(strategy, '6M');
    setSelectedForBacktest(strategy);
    setBacktestResult(result);
    setBacktestModalVisible(true);
  };

  const categories = useMemo(() => [
    'All', 
    'Options Selling', 
    'Options Buying', 
    'Intraday Trend', 
    'Scalping'
  ], []);

  // Robust filtering across tabs, categories, and search
  const filteredStrategies = useMemo(() => {
    return strategies.filter((s) => {
      // Tab matching
      let matchesTab = true;
      if (activeTab === 'Subscribed') {
        matchesTab = !!s.isSubscribed;
      } else if (activeTab === 'My Algos') {
        matchesTab = s.creatorName.toLowerCase().includes('quant') || !s.isSubscribed;
      }

      // Category matching
      let matchesCategory = true;
      if (selectedCategory !== 'All') {
        if (selectedCategory === 'Intraday Trend') {
          matchesCategory = s.category === 'Intraday Trend' || s.description.toLowerCase().includes('trend') || s.name.toLowerCase().includes('supertrend');
        } else {
          matchesCategory = s.category === selectedCategory;
        }
      }

      // Search query matching
      let matchesSearch = true;
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        matchesSearch = 
          s.name.toLowerCase().includes(q) || 
          s.description.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.creatorName.toLowerCase().includes(q) ||
          s.underlying.some(u => u.toLowerCase().includes(q));
      }

      return matchesTab && matchesCategory && matchesSearch;
    });
  }, [strategies, activeTab, selectedCategory, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedStratId(expandedStratId === id ? null : id);
  };

  return (
    <View style={styles.screen}>
      {/* Subtle Background Gradient */}
      <LinearGradient
        colors={['#EAF2F9', '#F0F5FA', '#F6F9FD']}
        style={StyleSheet.absoluteFill}
      />

      {/* Top Header */}
      <Header title="Tradetron" subtitle="Strategy Marketplace" />

      {/* FIXED TOP FILTER BAR SECTION (Does not scroll away) */}
      <View style={styles.fixedFilterSection}>
        {/* Search Bar & + Build Button */}
        <View style={styles.searchBarRow}>
          <View style={styles.searchContainer}>
            <Feather name="search" size={14} color={Colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search strategies, indicators..."
              placeholderTextColor={Colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => setSearchQuery('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="x" size={14} color={Colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>

          {/* + Build Custom Strategy Action */}
          <TouchableOpacity 
            style={styles.createBtn} 
            activeOpacity={0.8}
            onPress={onOpenBuilder}
          >
            <Feather name="plus" size={14} color="#FFFFFF" />
            <Text style={styles.createBtnText}>Build</Text>
          </TouchableOpacity>
        </View>

        {/* Module 7: Creator Shortcuts & Leaderboard Action Row */}
        <View style={styles.creatorShortcutsRow}>
          <TouchableOpacity 
            style={styles.creatorShortcutBtn} 
            onPress={() => setLeaderboardOpen(true)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="trophy-award" size={13} color="#F59E0B" />
            <Text style={styles.creatorShortcutText}>Leaderboard</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.creatorShortcutBtn} 
            onPress={() => setCreatorStudioOpen(true)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="briefcase-outline" size={13} color={Colors.primary} />
            <Text style={styles.creatorShortcutText}>Creator Studio</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.creatorShortcutBtn, styles.publishShortcutBtn]} 
            onPress={() => setPublishModalOpen(true)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="rocket-launch-outline" size={13} color={Colors.accentGreen} />
            <Text style={[styles.creatorShortcutText, { color: Colors.accentGreen }]}>Publish Algo</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Segment (Marketplace / Subscribed / My Algos) */}
        <View style={styles.tabContainer}>
          {(['Marketplace', 'Subscribed', 'My Algos'] as const).map((tab) => {
            const isTabActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabBtn, isTabActive && styles.tabBtnActive]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, isTabActive && styles.tabTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Horizontal Category Filter Pills with Full Height (No Text Clipping) */}
        <View style={styles.categoryScrollWrapper}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.categoryContainer}
          >
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catPill, isSelected && styles.catPillActive]}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.catPillText, isSelected && styles.catPillTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Results Counter Sub-header */}
        <View style={styles.resultsInfoRow}>
          <Text style={styles.resultsCountText}>
            Showing <Text style={styles.countHighlight}>{filteredStrategies.length}</Text> algorithmic strategies
          </Text>
          {(selectedCategory !== 'All' || searchQuery.length > 0) && (
            <TouchableOpacity 
              onPress={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
            >
              <Text style={styles.resetFilterText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* SCROLLABLE STRATEGIES LIST */}
      <ScrollView 
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      >
        {filteredStrategies.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <MaterialCommunityIcons name="robot-confused-outline" size={44} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Strategies Match Filters</Text>
            <Text style={styles.emptyDesc}>
              Try selecting a different category or clear the search query.
            </Text>
            <TouchableOpacity 
              style={styles.resetBtn} 
              onPress={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                setActiveTab('Marketplace');
              }}
            >
              <Text style={styles.resetBtnText}>Reset All Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredStrategies.map((item) => {
            const isExpanded = expandedStratId === item.id;
            const itemReviews = reviews[item.id] || [];
            const avgStar = itemReviews.length > 0
              ? (itemReviews.reduce((sum, r) => sum + r.rating, 0) / itemReviews.length).toFixed(1)
              : '4.8';

            return (
              <Card key={item.id} style={styles.stratCard} variant="blueGlass">
                {/* Top Header: Category Tag, Underlying, Version & Price */}
                <View style={styles.cardTopRow}>
                  <View style={styles.tagsLeftRow}>
                    <View style={styles.categoryTag}>
                      <Text style={styles.categoryTagText}>{item.category}</Text>
                    </View>
                    <View style={styles.underlyingTag}>
                      <Text style={styles.underlyingTagText}>
                        {item.underlying.join(', ')} • {item.timeframe}
                      </Text>
                    </View>
                  </View>

                  {/* Pricing Badge / Subscribe trigger */}
                  <TouchableOpacity
                    style={[
                      styles.priceBadge, 
                      item.pricingMonthly === 0 ? styles.priceFree : styles.pricePaid
                    ]}
                    onPress={() => setCheckoutModalOpen(true, item)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.priceBadgeText, 
                      item.pricingMonthly === 0 ? styles.textFree : styles.textPaid
                    ]}>
                      {item.isSubscribed ? 'SUBSCRIBED' : item.pricingMonthly === 0 ? 'FREE' : `₹${item.pricingMonthly}/mo`}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Strategy Title & Verified Creator & Reviews Pill */}
                <View style={styles.titleSection}>
                  <Text style={styles.stratTitle}>{item.name}</Text>
                  <View style={styles.creatorAndRatingRow}>
                    <View style={styles.creatorRow}>
                      <Text style={styles.creatorLabel}>
                        by <Text style={styles.creatorName}>{item.creatorName}</Text>
                      </Text>
                      <MaterialCommunityIcons name="check-decagram" size={13} color={Colors.primary} />
                      <Text style={styles.versionBadge}>{item.version}</Text>
                    </View>

                    {/* Social Star Review Trigger */}
                    <TouchableOpacity
                      style={styles.reviewRatingPill}
                      onPress={() => setReviewsModalOpen(true, item)}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons name="star" size={12} color="#F59E0B" />
                      <Text style={styles.reviewRatingText}>{avgStar}</Text>
                      <Text style={styles.reviewRatingCount}>({itemReviews.length || 12})</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Description */}
                <Text style={styles.descriptionText} numberOfLines={isExpanded ? undefined : 2}>
                  {item.description}
                </Text>

                {/* 4-Column Metrics Bar (Compact, High-Contrast) */}
                <View style={styles.metricsBar}>
                  <View style={styles.metricColumn}>
                    <Text style={styles.metricLabel}>Win Rate</Text>
                    <Text style={[styles.metricValue, { color: Colors.accentGreen }]}>
                      {item.winRate}%
                    </Text>
                  </View>
                  <View style={styles.metricDivider} />

                  <View style={styles.metricColumn}>
                    <Text style={styles.metricLabel}>Backtest CAGR</Text>
                    <Text style={[styles.metricValue, { color: Colors.primary }]}>
                      +{item.cagr}%
                    </Text>
                  </View>
                  <View style={styles.metricDivider} />

                  <View style={styles.metricColumn}>
                    <Text style={styles.metricLabel}>Max Drawdown</Text>
                    <Text style={[styles.metricValue, { color: Colors.accentCoral }]}>
                      {item.maxDrawdown}%
                    </Text>
                  </View>
                  <View style={styles.metricDivider} />

                  <View style={styles.metricColumn}>
                    <Text style={styles.metricLabel}>Min Capital</Text>
                    <Text style={styles.metricValue}>
                      ₹{(item.capitalRequired / 1000).toFixed(0)}k
                    </Text>
                  </View>
                </View>

                {/* Expanded Details Section: Condition rules & legs preview */}
                {isExpanded && (
                  <View style={styles.expandedBox}>
                    <Text style={styles.expandedHeading}>Execution Logic:</Text>
                    {item.conditions.map((c) => (
                      <View key={c.id} style={styles.condRow}>
                        <Text style={styles.condBullet}>•</Text>
                        <Text style={styles.condText}>
                          {c.leftOperand} {c.operator.replace('_', ' ')} {c.rightOperand}
                        </Text>
                      </View>
                    ))}

                    <Text style={[styles.expandedHeading, { marginTop: 8 }]}>
                      Configured Legs ({item.legs.length}):
                    </Text>
                    {item.legs.map((l) => (
                      <View key={l.id} style={styles.legPreviewRow}>
                        <View style={[styles.legBadge, l.action === 'BUY' ? styles.buyBg : styles.sellBg]}>
                          <Text style={[styles.legBadgeTxt, l.action === 'BUY' ? styles.buyTxt : styles.sellTxt]}>
                            {l.action}
                          </Text>
                        </View>
                        <Text style={styles.legDetailTxt}>
                          {l.instrument} {l.strikeOffset} {l.optionType} ({l.expiry}) • {l.lots} lot(s)
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Card Footer: Deployment count & Action Buttons */}
                <View style={styles.cardFooter}>
                  <View style={styles.subCountRow}>
                    <MaterialCommunityIcons name="account-group-outline" size={14} color={Colors.textTertiary} />
                    <Text style={styles.subCountText}>{item.subscribersCount} deployed</Text>
                  </View>

                  <View style={styles.actionButtonGroup}>
                    {/* Backtest Analytics Button */}
                    <TouchableOpacity 
                      style={styles.backtestIconBtn}
                      onPress={() => handleOpenBacktest(item)}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons name="chart-bell-curve-cumulative" size={13} color={Colors.primary} />
                      <Text style={styles.backtestIconBtnText}>Test</Text>
                    </TouchableOpacity>

                    {/* Toggle Rules/Details */}
                    <TouchableOpacity 
                      style={styles.detailsBtn}
                      onPress={() => toggleExpand(item.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.detailsBtnText}>{isExpanded ? 'Hide' : 'Rules'}</Text>
                      <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={12} color={Colors.textSecondary} />
                    </TouchableOpacity>

                    {/* 1-Click Deploy Pill Button */}
                    <TouchableOpacity 
                      style={styles.deployBtn} 
                      activeOpacity={0.8}
                      onPress={() => {
                        if (!item.isSubscribed && item.pricingMonthly > 0) {
                          setCheckoutModalOpen(true, item);
                        } else if (onOpenDeploy) {
                          onOpenDeploy(item);
                        }
                      }}
                    >
                      <MaterialCommunityIcons 
                        name={item.isSubscribed || item.pricingMonthly === 0 ? "rocket-launch" : "flash"} 
                        size={13} 
                        color="#FFFFFF" 
                      />
                      <Text style={styles.deployBtnText}>
                        {item.isSubscribed || item.pricingMonthly === 0 ? 'Deploy' : 'Subscribe'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* Backtest Report Modal */}
      <BacktestReportModal
        visible={backtestModalVisible}
        onClose={() => setBacktestModalVisible(false)}
        result={backtestResult}
        strategy={selectedForBacktest}
        onDeploy={() => {
          setBacktestModalVisible(false);
          if (selectedForBacktest && onOpenDeploy) {
            onOpenDeploy(selectedForBacktest);
          }
        }}
      />

      {/* Module 7: Marketplace Modals */}
      <PublishStrategyModal
        visible={isPublishModalOpen}
        onClose={() => setPublishModalOpen(false)}
      />

      <CreatorStudioModal
        visible={isCreatorStudioOpen}
        onClose={() => setCreatorStudioOpen(false)}
        onOpenPublishModal={() => setPublishModalOpen(true)}
      />

      <SocialLeaderboardModal
        visible={isLeaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
      />

      <StrategyReviewsModal
        visible={isReviewsModalOpen}
        onClose={() => setReviewsModalOpen(false)}
        strategy={selectedStrategyForReviews}
      />

      <SubscriptionCheckoutModal
        visible={isCheckoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        strategy={selectedStrategyForCheckout}
        onSuccessDeploy={(strat) => {
          if (onOpenDeploy) onOpenDeploy(strat);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  fixedFilterSection: {
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingBottom: 4,
  },
  searchBarRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 6,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: BorderRadius.round,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.borderGlass,
    gap: 6,
    ...Shadows.subtle,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.round,
    ...Shadows.button,
  },
  createBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  creatorShortcutsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  creatorShortcutBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: Colors.borderGlass,
    ...Shadows.subtle,
  },
  publishShortcutBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  creatorShortcutText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  creatorAndRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  reviewRatingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.round,
  },
  reviewRatingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  reviewRatingCount: {
    fontSize: 9,
    color: Colors.textTertiary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(240, 246, 255, 0.95)',
    borderRadius: BorderRadius.round,
    padding: 3,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.borderGlass,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    ...Shadows.subtle,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  categoryScrollWrapper: {
    marginBottom: 6,
  },
  categoryContainer: {
    gap: 6,
    paddingVertical: 2,
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: Colors.borderGlass,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    ...Shadows.subtle,
  },
  catPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  catPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  resultsInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
    paddingBottom: 4,
  },
  resultsCountText: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  countHighlight: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  resetFilterText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxxl * 2,
    paddingTop: 4,
  },
  stratCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tagsLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  categoryTag: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.15)',
  },
  categoryTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: Colors.primary,
  },
  underlyingTag: {
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  underlyingTagText: {
    fontSize: 9.5,
    color: Colors.textTertiary,
    fontWeight: '600',
  },
  priceBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: BorderRadius.round,
  },
  priceFree: {
    backgroundColor: Colors.accentGreenLight,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  pricePaid: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.2)',
  },
  priceBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  textFree: {
    color: Colors.accentGreen,
  },
  textPaid: {
    color: Colors.primary,
  },
  titleSection: {
    marginBottom: 4,
  },
  stratTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  creatorLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  creatorName: {
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  versionBadge: {
    fontSize: 9,
    color: Colors.textTertiary,
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    marginLeft: 4,
  },
  descriptionText: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: 8,
  },
  metricsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: BorderRadius.md,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.16)',
    marginBottom: 8,
  },
  metricColumn: {
    alignItems: 'center',
    flex: 1,
  },
  metricDivider: {
    width: 1,
    height: '75%',
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    alignSelf: 'center',
  },
  metricLabel: {
    fontSize: 8.5,
    color: Colors.textTertiary,
    fontWeight: '600',
    marginBottom: 1,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  expandedBox: {
    backgroundColor: 'rgba(241, 246, 251, 0.8)',
    padding: 8,
    borderRadius: BorderRadius.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.borderGlass,
  },
  expandedHeading: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  condRow: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    marginBottom: 2,
  },
  condBullet: {
    fontSize: 12,
    color: Colors.primary,
  },
  condText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  legPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  legBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  buyBg: {
    backgroundColor: Colors.primaryLight,
  },
  sellBg: {
    backgroundColor: Colors.accentCoralLight,
  },
  legBadgeTxt: {
    fontSize: 8.5,
    fontWeight: '800',
  },
  buyTxt: {
    color: Colors.primary,
  },
  sellTxt: {
    color: Colors.accentCoral,
  },
  legDetailTxt: {
    fontSize: 9.5,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  subCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subCountText: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: '600',
  },
  actionButtonGroup: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  backtestIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(30, 80, 220, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(30, 80, 220, 0.22)',
  },
  backtestIconBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: Colors.primary,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailsBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  deployBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5.5,
    borderRadius: BorderRadius.round,
    ...Shadows.button,
  },
  deployBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 8,
  },
  emptyDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.md,
  },
  resetBtn: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.2)',
  },
  resetBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
});
