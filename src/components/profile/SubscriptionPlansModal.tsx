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
import { Colors, Spacing, BorderRadius, Shadows } from '../../theme';
import { Card } from '../common/Card';
import { useAppStore } from '../../store/useAppStore';

interface SubscriptionPlansModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SubscriptionPlansModal: React.FC<SubscriptionPlansModalProps> = ({
  visible,
  onClose,
}) => {
  const user = useAppStore((state) => state.user);
  const planTiers = useAppStore((state) => state.planTiers);
  const platformInvoices = useAppStore((state) => state.platformInvoices);
  const upgradePlatformPlan = useAppStore((state) => state.upgradePlatformPlan);

  const [activeTab, setActiveTab] = useState<'PLANS' | 'INVOICES'>('PLANS');

  const handleUpgrade = (planId: string, planName: string) => {
    if (user.plan?.toLowerCase() === planName.toLowerCase()) {
      Alert.alert('Current Plan', `You are already subscribed to the ${planName} plan.`);
      return;
    }

    Alert.alert(
      'Confirm Subscription',
      `Upgrade account to ${planName} plan? Billed automatically every 30 days.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Upgrade',
          onPress: () => {
            upgradePlatformPlan(planId);
            Alert.alert('Upgrade Successful', `Your Tradetron account has been upgraded to ${planName}!`);
          },
        },
      ]
    );
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    Alert.alert(
      'Invoice Downloaded',
      `Tax Invoice #${invoiceId} with 18% GST breakdown saved as PDF.`
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconContainer}>
                <MaterialCommunityIcons name="crown-outline" size={20} color="#F59E0B" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Plans & Platform Billing</Text>
                <Text style={styles.headerSubtitle}>Manage deployment capacity & invoices</Text>
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

          {/* Tab Selector */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'PLANS' && styles.tabBtnActive]}
              onPress={() => setActiveTab('PLANS')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'PLANS' && styles.tabBtnTextActive]}>
                Subscription Plans
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'INVOICES' && styles.tabBtnActive]}
              onPress={() => setActiveTab('INVOICES')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'INVOICES' && styles.tabBtnTextActive]}>
                Billing Invoices ({platformInvoices.length})
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollBody} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {activeTab === 'PLANS' ? (
              <>
                {planTiers.map((tier) => {
                  const isCurrent = user.plan?.toLowerCase() === tier.name.toLowerCase();

                  return (
                    <Card
                      key={tier.id}
                      style={[styles.planCard, tier.isPopular && styles.popularCard]}
                      variant="blueGlass"
                    >
                      {/* Popular Ribbon */}
                      {tier.isPopular && (
                        <View style={styles.popularRibbon}>
                          <Text style={styles.popularRibbonText}>MOST POPULAR</Text>
                        </View>
                      )}

                      <View style={styles.planHeader}>
                        <View>
                          <Text style={styles.planName}>{tier.name}</Text>
                          <Text style={styles.planDeployments}>
                            Up to <Text style={{ fontWeight: '800' }}>{tier.maxDeployments}</Text> Active Deployments
                          </Text>
                        </View>

                        <View style={styles.priceCol}>
                          <Text style={styles.priceValue}>
                            {tier.priceMonthly === 0 ? 'FREE' : `₹${tier.priceMonthly.toLocaleString('en-IN')}`}
                          </Text>
                          {tier.priceMonthly > 0 && <Text style={styles.priceSub}>/ month</Text>}
                        </View>
                      </View>

                      <View style={styles.divider} />

                      {/* Feature Checklist */}
                      <View style={styles.featuresList}>
                        {tier.features.map((feat, idx) => (
                          <View key={idx} style={styles.featureRow}>
                            <Feather name="check-circle" size={13} color={Colors.accentGreen} />
                            <Text style={styles.featureText}>{feat}</Text>
                          </View>
                        ))}
                      </View>

                      {/* Action Button */}
                      <TouchableOpacity
                        style={[
                          styles.planActionBtn,
                          isCurrent && styles.currentPlanBtn,
                          tier.isPopular && !isCurrent && styles.popularActionBtn,
                        ]}
                        onPress={() => handleUpgrade(tier.id, tier.name)}
                        disabled={isCurrent}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.planActionText,
                            isCurrent && styles.currentPlanText,
                            tier.isPopular && !isCurrent && styles.popularActionText,
                          ]}
                        >
                          {isCurrent ? 'Current Active Plan' : `Upgrade to ${tier.name}`}
                        </Text>
                      </TouchableOpacity>
                    </Card>
                  );
                })}
              </>
            ) : (
              <View style={styles.invoicesList}>
                <Text style={styles.sectionTitle}>Platform Invoices & Receipts</Text>
                {platformInvoices.map((inv) => (
                  <Card key={inv.id} style={styles.invoiceCard} variant="glass">
                    <View style={styles.invoiceTop}>
                      <View>
                        <Text style={styles.invPlanName}>{inv.planName}</Text>
                        <Text style={styles.invPeriod}>{inv.billingPeriod}</Text>
                      </View>

                      <View style={styles.invAmountCol}>
                        <Text style={styles.invAmount}>
                          {inv.amount === 0 ? 'FREE' : `₹${inv.amount.toLocaleString('en-IN')}`}
                        </Text>
                        <View style={styles.paidBadge}>
                          <Text style={styles.paidText}>{inv.status}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.invFooter}>
                      <Text style={styles.invId}>Invoice: #{inv.id}</Text>
                      <TouchableOpacity 
                        style={styles.invDownloadBtn}
                        onPress={() => handleDownloadInvoice(inv.id)}
                      >
                        <Feather name="download" size={12} color={Colors.primary} />
                        <Text style={styles.invDownloadText}>PDF Receipt</Text>
                      </TouchableOpacity>
                    </View>
                  </Card>
                ))}
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
    flex: 1,
  },
  headerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
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
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabRow: {
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
  planCard: {
    padding: 14,
    borderRadius: 16,
    gap: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  popularCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  popularRibbon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  popularRibbonText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  planDeployments: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  priceCol: {
    alignItems: 'flex-end',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  priceSub: {
    fontSize: 9.5,
    color: Colors.textTertiary,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(226, 232, 240, 0.8)',
  },
  featuresList: {
    gap: 6,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 11,
    color: Colors.textSecondary,
    flex: 1,
  },
  planActionBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
    ...Shadows.button,
  },
  popularActionBtn: {
    backgroundColor: Colors.primary,
  },
  currentPlanBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: Colors.accentGreen,
    shadowOpacity: 0,
    elevation: 0,
  },
  planActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  popularActionText: {
    color: '#FFFFFF',
  },
  currentPlanText: {
    color: Colors.accentGreen,
  },
  invoicesList: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  invoiceCard: {
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  invoiceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  invPlanName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  invPeriod: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  invAmountCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  invAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  paidBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  paidText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: Colors.accentGreen,
  },
  invFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 6,
  },
  invId: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  invDownloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  invDownloadText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
});
