import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../../theme';
import { Card } from '../common/Card';
import { useAppStore } from '../../store/useAppStore';
import { CreatorProfile } from '../../types';

interface SocialLeaderboardModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCreator?: (creator: CreatorProfile) => void;
}

export const SocialLeaderboardModal: React.FC<SocialLeaderboardModalProps> = ({
  visible,
  onClose,
  onSelectCreator,
}) => {
  const creators = useAppStore((state) => state.creators);
  const [filterTab, setFilterTab] = useState<'ALL' | 'SEBI_VERIFIED' | 'TOP_AUM'>('ALL');
  const [followedCreatorIds, setFollowedCreatorIds] = useState<Record<string, boolean>>({});

  const toggleFollow = (creatorId: string) => {
    setFollowedCreatorIds((prev) => ({
      ...prev,
      [creatorId]: !prev[creatorId],
    }));
  };

  const filteredCreators = useMemo(() => {
    if (filterTab === 'SEBI_VERIFIED') {
      return creators.filter((c) => !!c.sebiRegistration);
    }
    if (filterTab === 'TOP_AUM') {
      return [...creators].sort((a, b) => b.totalAumDeployed - a.totalAumDeployed);
    }
    return creators;
  }, [creators, filterTab]);

  const getRankBadgeStyle = (rank: number) => {
    if (rank === 1) {
      return {
        bg: 'rgba(245, 158, 11, 0.18)',
        border: '#F59E0B',
        color: '#D97706',
        icon: 'trophy',
        label: '#1 Top Quant',
      };
    }
    if (rank === 2) {
      return {
        bg: 'rgba(148, 163, 184, 0.22)',
        border: '#94A3B8',
        color: '#475569',
        icon: 'medal',
        label: '#2 Quant',
      };
    }
    if (rank === 3) {
      return {
        bg: 'rgba(180, 83, 9, 0.16)',
        border: '#B45309',
        color: '#92400E',
        icon: 'medal-outline',
        label: '#3 Quant',
      };
    }
    return {
      bg: 'rgba(226, 232, 240, 0.6)',
      border: '#CBD5E1',
      color: Colors.textSecondary,
      icon: 'star-outline',
      label: `#${rank}`,
    };
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Top Modal Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconContainer}>
                <MaterialCommunityIcons name="trophy-award" size={22} color="#F59E0B" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Quant Leaderboard</Text>
                <Text style={styles.headerSubtitle}>Top performing algo creators & fund managers</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.closeBtn} 
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="x" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Filter Pills */}
          <View style={styles.filterPillsRow}>
            {(['ALL', 'SEBI_VERIFIED', 'TOP_AUM'] as const).map((tab) => {
              const isActive = filterTab === tab;
              const label = tab === 'ALL' ? 'All Quants' : tab === 'SEBI_VERIFIED' ? 'SEBI Registered' : 'Highest AUM';
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.filterPill, isActive && styles.filterPillActive]}
                  onPress={() => setFilterTab(tab)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Creators List */}
          <ScrollView 
            style={styles.scrollBody} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {filteredCreators.map((creator) => {
              const isFollowed = !!followedCreatorIds[creator.id];
              const rankInfo = getRankBadgeStyle(creator.rank);

              return (
                <Card key={creator.id} style={styles.creatorCard} variant="blueGlass">
                  <View style={styles.cardInner}>
                    {/* Top Row: Rank Tag, Avatar, Name & Follow Button */}
                    <View style={styles.cardHeaderRow}>
                      <View style={styles.creatorInfoLeft}>
                        {/* Avatar with Verified badge overlay */}
                        <View style={styles.avatarContainer}>
                          <Image source={{ uri: creator.avatarUrl }} style={styles.avatar} />
                          {creator.isVerified && (
                            <View style={styles.verifiedIconOverlay}>
                              <MaterialCommunityIcons name="check-decagram" size={13} color={Colors.primary} />
                            </View>
                          )}
                        </View>

                        {/* Name & Handle */}
                        <View style={styles.nameBlock}>
                          <View style={styles.nameRow}>
                            <Text style={styles.creatorName} numberOfLines={1}>
                              {creator.name}
                            </Text>
                          </View>
                          <Text style={styles.handleText}>{creator.handle}</Text>
                        </View>
                      </View>

                      {/* Right: Rank Badge & Follow Action */}
                      <View style={styles.headerRightCol}>
                        <View style={[styles.rankBadge, { backgroundColor: rankInfo.bg, borderColor: rankInfo.border }]}>
                          <MaterialCommunityIcons name={rankInfo.icon as any} size={11} color={rankInfo.color} />
                          <Text style={[styles.rankBadgeText, { color: rankInfo.color }]}>
                            {rankInfo.label}
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={[styles.followBtn, isFollowed && styles.followBtnActive]}
                          onPress={() => toggleFollow(creator.id)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.followBtnText, isFollowed && styles.followBtnTextActive]}>
                            {isFollowed ? 'Following' : '+ Follow'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Bio Description */}
                    <Text style={styles.bioText} numberOfLines={2}>
                      {creator.bio}
                    </Text>

                    {/* Badges Row: SEBI Registration & Active Strategies */}
                    <View style={styles.badgesRow}>
                      {creator.sebiRegistration ? (
                        <View style={styles.sebiBadge}>
                          <MaterialCommunityIcons name="shield-check" size={12} color={Colors.accentGreen} />
                          <Text style={styles.sebiText}>SEBI Reg: {creator.sebiRegistration}</Text>
                        </View>
                      ) : (
                        <View style={styles.commBadge}>
                          <MaterialCommunityIcons name="account-star-outline" size={12} color={Colors.primary} />
                          <Text style={styles.commBadgeText}>Community Quant</Text>
                        </View>
                      )}

                      <View style={styles.algosCountBadge}>
                        <MaterialCommunityIcons name="robot-outline" size={12} color={Colors.textSecondary} />
                        <Text style={styles.algosCountText}>{creator.activeStrategiesCount} Public Algos</Text>
                      </View>
                    </View>

                    {/* 4-Grid Performance Metrics Bar */}
                    <View style={styles.metricsBar}>
                      <View style={styles.metricCol}>
                        <Text style={styles.metricLabel}>AUM DEPLOYED</Text>
                        <Text style={styles.metricVal}>
                          ₹{(creator.totalAumDeployed / 10000000).toFixed(2)} Cr
                        </Text>
                      </View>

                      <View style={styles.metricDivider} />

                      <View style={styles.metricCol}>
                        <Text style={styles.metricLabel}>SUBSCRIBERS</Text>
                        <Text style={styles.metricVal}>
                          {creator.totalSubscribers.toLocaleString('en-IN')}
                        </Text>
                      </View>

                      <View style={styles.metricDivider} />

                      <View style={styles.metricCol}>
                        <Text style={styles.metricLabel}>WIN RATE</Text>
                        <Text style={[styles.metricVal, { color: Colors.accentGreen }]}>
                          {creator.avgWinRate}%
                        </Text>
                      </View>

                      <View style={styles.metricDivider} />

                      <View style={styles.metricCol}>
                        <Text style={styles.metricLabel}>SHARPE</Text>
                        <Text style={[styles.metricVal, { color: Colors.primary }]}>
                          {creator.avgSharpeRatio}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Card>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 24,
    ...Shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.8)',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterPillsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollBody: {
    paddingHorizontal: Spacing.md,
  },
  scrollContent: {
    paddingVertical: 12,
    gap: 10,
  },
  creatorCard: {
    marginBottom: 2,
  },
  cardInner: {
    padding: 12,
    gap: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  creatorInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#CBD5E1',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  verifiedIconOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 7,
  },
  nameBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  creatorName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  handleText: {
    fontSize: 10.5,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  headerRightCol: {
    alignItems: 'flex-end',
    gap: 5,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  rankBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  followBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.round,
    minWidth: 70,
    alignItems: 'center',
    ...Shadows.subtle,
  },
  followBtnActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  followBtnText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
  },
  followBtnTextActive: {
    color: Colors.primary,
  },
  bioText: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  sebiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  sebiText: {
    fontSize: 9.5,
    color: Colors.accentGreen,
    fontWeight: '700',
  },
  commBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  commBadgeText: {
    fontSize: 9.5,
    color: Colors.primary,
    fontWeight: '600',
  },
  algosCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  algosCountText: {
    fontSize: 9.5,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  metricsBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    alignItems: 'center',
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 8.5,
    color: Colors.textTertiary,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  metricVal: {
    fontSize: 11.5,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  metricDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#E2E8F0',
  },
});
