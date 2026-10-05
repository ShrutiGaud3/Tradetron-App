import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Shadows } from '../../theme';
import { Card } from '../common/Card';
import { useAppStore } from '../../store/useAppStore';

interface CreatorStudioModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenPublishModal?: () => void;
}

export const CreatorStudioModal: React.FC<CreatorStudioModalProps> = ({
  visible,
  onClose,
  onOpenPublishModal,
}) => {
  const creatorEarnings = useAppStore((state) => state.creatorEarnings);
  const requestCreatorPayout = useAppStore((state) => state.requestCreatorPayout);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'INVOICES' | 'SETTINGS'>('OVERVIEW');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleInstantPayout = () => {
    if (creatorEarnings.pendingPayout <= 0) {
      Alert.alert('No Pending Balance', 'All earnings have already been settled to your verified account.');
      return;
    }

    Alert.alert(
      'Request Instant IMPS Transfer',
      `Transfer ₹${creatorEarnings.pendingPayout.toLocaleString('en-IN')} to ${creatorEarnings.payoutAccount}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Transfer',
          style: 'default',
          onPress: () => {
            setIsWithdrawing(true);
            setTimeout(() => {
              requestCreatorPayout(creatorEarnings.pendingPayout);
              setIsWithdrawing(false);
              Alert.alert('Transfer Initiated', 'Funds will reflect in your linked bank account within 15 minutes.');
            }, 800);
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Top Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconContainer}>
                <MaterialCommunityIcons name="briefcase-check-outline" size={20} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Creator Monetization Studio</Text>
                <Text style={styles.headerSubtitle}>Manage subscribers, payouts & invoices</Text>
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

          {/* Navigation Tab Bar */}
          <View style={styles.tabsRow}>
            {(['OVERVIEW', 'INVOICES', 'SETTINGS'] as const).map((t) => {
              const isSelected = activeTab === t;
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.tabBtn, isSelected && styles.tabBtnActive]}
                  onPress={() => setActiveTab(t)}
                >
                  <Text style={[styles.tabBtnText, isSelected && styles.tabBtnTextActive]}>
                    {t === 'OVERVIEW' ? 'Revenue Analytics' : t === 'INVOICES' ? 'Subscriber Invoices' : 'Payout Settings'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <ScrollView 
            style={styles.scrollBody} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {activeTab === 'OVERVIEW' && (
              <>
                {/* 4-Grid Metrics Overview */}
                <View style={styles.metricsGrid}>
                  <Card style={styles.metricCard} variant="blueGlass">
                    <View style={styles.metricCardHeader}>
                      <Text style={styles.metricCardLabel}>This Month</Text>
                      <Feather name="trending-up" size={14} color={Colors.accentGreen} />
                    </View>
                    <Text style={[styles.metricCardValue, { color: Colors.accentGreen }]}>
                      ₹{creatorEarnings.thisMonthEarnings.toLocaleString('en-IN')}
                    </Text>
                    <Text style={styles.metricCardSub}>+18.4% vs last month</Text>
                  </Card>

                  <Card style={styles.metricCard} variant="blueGlass">
                    <View style={styles.metricCardHeader}>
                      <Text style={styles.metricCardLabel}>Subscribers</Text>
                      <MaterialCommunityIcons name="account-group" size={15} color={Colors.primary} />
                    </View>
                    <Text style={[styles.metricCardValue, { color: Colors.primary }]}>
                      {creatorEarnings.activeSubscribers}
                    </Text>
                    <Text style={styles.metricCardSub}>Active deployments</Text>
                  </Card>

                  <Card style={styles.metricCard} variant="glass">
                    <View style={styles.metricCardHeader}>
                      <Text style={styles.metricCardLabel}>Total Revenue</Text>
                      <Feather name="award" size={14} color={Colors.textSecondary} />
                    </View>
                    <Text style={styles.metricCardValue}>
                      ₹{(creatorEarnings.totalRevenue / 100000).toFixed(2)}L
                    </Text>
                    <Text style={styles.metricCardSub}>Lifetime volume</Text>
                  </Card>

                  <Card style={styles.metricCard} variant="glass">
                    <View style={styles.metricCardHeader}>
                      <Text style={styles.metricCardLabel}>Platform Cut</Text>
                      <Feather name="shield" size={14} color={Colors.textTertiary} />
                    </View>
                    <Text style={styles.metricCardValue}>5%</Text>
                    <Text style={styles.metricCardSub}>Tradetron Escrow</Text>
                  </Card>
                </View>

                {/* Instant Bank Payout Card */}
                <Card style={styles.payoutCard} variant="blueGlass">
                  <View style={styles.payoutCardTop}>
                    <View>
                      <Text style={styles.payoutCardLabel}>Pending Payout Balance</Text>
                      <Text style={styles.payoutCardValue}>
                        ₹{creatorEarnings.pendingPayout.toLocaleString('en-IN')}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.instantPayoutBtn, isWithdrawing && { opacity: 0.7 }]}
                      onPress={handleInstantPayout}
                      disabled={isWithdrawing}
                    >
                      <MaterialCommunityIcons name="lightning-bolt" size={14} color="#FFFFFF" />
                      <Text style={styles.instantPayoutBtnText}>
                        {isWithdrawing ? 'Processing...' : 'Instant Payout'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.payoutDetailsRow}>
                    <MaterialCommunityIcons name="bank-outline" size={14} color={Colors.textSecondary} />
                    <Text style={styles.payoutAccountText}>
                      Linked Account: <Text style={styles.payoutAccountBold}>{creatorEarnings.payoutAccount}</Text>
                    </Text>
                  </View>
                </Card>

                {/* Quick Action: Publish Strategy Banner */}
                <TouchableOpacity
                  style={styles.publishActionBanner}
                  onPress={() => {
                    onClose();
                    if (onOpenPublishModal) onOpenPublishModal();
                  }}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#2563EB', '#1D4ED8']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.publishBannerGradient}
                  >
                    <View style={styles.publishBannerLeft}>
                      <View style={styles.publishBannerIconBox}>
                        <MaterialCommunityIcons name="plus-box" size={20} color="#FFFFFF" />
                      </View>
                      <View>
                        <Text style={styles.publishBannerTitle}>Publish a New Algo</Text>
                        <Text style={styles.publishBannerSub}>List on marketplace with monthly or profit-share pricing</Text>
                      </View>
                    </View>
                    <Feather name="arrow-right" size={16} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            {activeTab === 'INVOICES' && (
              <View style={styles.invoicesSection}>
                <Text style={styles.sectionTitle}>Subscriber Invoices & Settlements</Text>
                {creatorEarnings.invoices.map((inv) => (
                  <Card key={inv.id} style={styles.invoiceCard} variant="glass">
                    <View style={styles.invoiceTopRow}>
                      <View style={styles.invoiceUserRow}>
                        <View style={styles.invoiceAvatarBox}>
                          <Text style={styles.invoiceAvatarTxt}>{inv.subscriberName[0]}</Text>
                        </View>
                        <View>
                          <Text style={styles.invoiceSubscriber}>{inv.subscriberName}</Text>
                          <Text style={styles.invoiceStrategy}>{inv.strategyName}</Text>
                        </View>
                      </View>

                      <View style={styles.invoiceAmountCol}>
                        <Text style={styles.invoiceAmount}>+₹{inv.amount}</Text>
                        <View style={styles.paidBadge}>
                          <Text style={styles.paidBadgeText}>{inv.status}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.invoiceFooter}>
                      <Text style={styles.invoiceDate}>{inv.date}</Text>
                      <Text style={styles.invoiceId}>ID: {inv.id}</Text>
                    </View>
                  </Card>
                ))}
              </View>
            )}

            {activeTab === 'SETTINGS' && (
              <View style={styles.settingsSection}>
                <Text style={styles.sectionTitle}>Banking & Settlement Configuration</Text>
                <Card style={styles.settingCard} variant="glass">
                  <View style={styles.settingRow}>
                    <MaterialCommunityIcons name="bank" size={20} color={Colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.settingLabel}>Verified Payout Account</Text>
                      <Text style={styles.settingValue}>{creatorEarnings.payoutAccount}</Text>
                    </View>
                    <Feather name="check-circle" size={16} color={Colors.accentGreen} />
                  </View>
                </Card>

                <Card style={styles.settingCard} variant="glass">
                  <View style={styles.settingRow}>
                    <MaterialCommunityIcons name="file-document-outline" size={20} color={Colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.settingLabel}>SEBI RA / IA Registration</Text>
                      <Text style={styles.settingValue}>Optional (Enhances Marketplace Trust Score)</Text>
                    </View>
                    <TouchableOpacity style={styles.addBtn}>
                      <Text style={styles.addBtnText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              </View>
            )}
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
  },
  headerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
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
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  tabBtnActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabBtnTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  scrollBody: {
    paddingHorizontal: Spacing.md,
  },
  scrollContent: {
    paddingVertical: 14,
    gap: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    width: '48%',
    padding: 12,
    borderRadius: 14,
    gap: 4,
  },
  metricCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricCardLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  metricCardValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  metricCardSub: {
    fontSize: 9,
    color: Colors.textTertiary,
  },
  payoutCard: {
    padding: 14,
    borderRadius: 14,
    gap: 10,
  },
  payoutCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payoutCardLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  payoutCardValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  instantPayoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    ...Shadows.button,
  },
  instantPayoutBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  payoutDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.6)',
  },
  payoutAccountText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  payoutAccountBold: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  publishActionBanner: {
    borderRadius: 14,
    overflow: 'hidden',
    ...Shadows.subtle,
  },
  publishBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  publishBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  publishBannerIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  publishBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  publishBannerSub: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  invoicesSection: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  invoiceCard: {
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  invoiceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invoiceUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  invoiceAvatarBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  invoiceAvatarTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  invoiceSubscriber: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  invoiceStrategy: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  invoiceAmountCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  invoiceAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.accentGreen,
  },
  paidBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  paidBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: Colors.accentGreen,
  },
  invoiceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 6,
  },
  invoiceDate: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  invoiceId: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  settingsSection: {
    gap: 8,
  },
  settingCard: {
    padding: 12,
    borderRadius: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  settingValue: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  addBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
});
