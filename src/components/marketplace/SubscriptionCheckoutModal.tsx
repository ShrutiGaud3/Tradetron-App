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
import { Strategy } from '../../types';

interface SubscriptionCheckoutModalProps {
  visible: boolean;
  onClose: () => void;
  strategy?: Strategy | null;
  onSuccessDeploy?: (strategy: Strategy) => void;
}

export const SubscriptionCheckoutModal: React.FC<SubscriptionCheckoutModalProps> = ({
  visible,
  onClose,
  strategy,
  onSuccessDeploy,
}) => {
  const toggleSubscribeStrategy = useAppStore((state) => state.toggleSubscribeStrategy);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'WALLET' | 'CARD'>('WALLET');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!strategy) return null;

  const isFree = strategy.pricingMonthly === 0;
  const gst = isFree ? 0 : Math.round(strategy.pricingMonthly * 0.18);
  const totalAmount = isFree ? 0 : strategy.pricingMonthly + gst;

  const handleConfirmSubscription = () => {
    setIsProcessing(true);

    setTimeout(() => {
      toggleSubscribeStrategy(strategy.id);
      setIsProcessing(false);
      setIsSuccess(true);
    }, 900);
  };

  const handleDone = () => {
    setIsSuccess(false);
    onClose();
    if (onSuccessDeploy) {
      onSuccessDeploy(strategy);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconContainer}>
                <MaterialCommunityIcons name="shield-key-outline" size={20} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.headerTitle}>
                  {strategy.isSubscribed ? 'Subscription Details' : 'Subscribe Strategy'}
                </Text>
                <Text style={styles.headerSubtitle}>1-Click Automated Execution License</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.closeBtn} 
              onPress={isSuccess ? handleDone : onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="x" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {isSuccess ? (
            <View style={styles.successBox}>
              <View style={styles.successIconCircle}>
                <MaterialCommunityIcons name="check-bold" size={36} color={Colors.accentGreen} />
              </View>
              <Text style={styles.successTitle}>Subscription Activated!</Text>
              <Text style={styles.successDesc}>
                You now have full multi-broker deployment rights for <Text style={{ fontWeight: '700' }}>{strategy.name}</Text>.
              </Text>

              <Card style={styles.successDetailsCard} variant="blueGlass">
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>License Type</Text>
                  <Text style={styles.detailVal}>Monthly Auto-Renew</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Execution Mode</Text>
                  <Text style={styles.detailVal}>Multi-Broker Live & Paper</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Next Renewal</Text>
                  <Text style={styles.detailVal}>05 Nov 2026</Text>
                </View>
              </Card>

              <TouchableOpacity style={styles.deployNowBtn} onPress={handleDone} activeOpacity={0.8}>
                <MaterialCommunityIcons name="rocket-launch" size={16} color="#FFFFFF" />
                <Text style={styles.deployNowBtnText}>Deploy to Broker Now</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView 
              style={styles.scrollBody} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Strategy Info Card */}
              <Card style={styles.stratSummaryCard} variant="blueGlass">
                <View style={styles.stratTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stratName}>{strategy.name}</Text>
                    <Text style={styles.stratCreator}>by {strategy.creatorName}</Text>
                  </View>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{strategy.category}</Text>
                  </View>
                </View>

                <View style={styles.stratMetricsRow}>
                  <View style={styles.miniMetric}>
                    <Text style={styles.miniMetricLabel}>Win Rate</Text>
                    <Text style={[styles.miniMetricVal, { color: Colors.accentGreen }]}>
                      {strategy.winRate}%
                    </Text>
                  </View>
                  <View style={styles.miniMetric}>
                    <Text style={styles.miniMetricLabel}>CAGR</Text>
                    <Text style={[styles.miniMetricVal, { color: Colors.primary }]}>
                      +{strategy.cagr}%
                    </Text>
                  </View>
                  <View style={styles.miniMetric}>
                    <Text style={styles.miniMetricLabel}>Max DD</Text>
                    <Text style={[styles.miniMetricVal, { color: Colors.accentCoral }]}>
                      {strategy.maxDrawdown}%
                    </Text>
                  </View>
                </View>
              </Card>

              {/* Price Breakdown */}
              <Card style={styles.billingCard} variant="glass">
                <Text style={styles.sectionTitle}>Billing Summary</Text>
                
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Monthly Strategy Fee</Text>
                  <Text style={styles.billVal}>
                    {isFree ? 'FREE (₹0)' : `₹${strategy.pricingMonthly.toLocaleString('en-IN')}`}
                  </Text>
                </View>

                {!isFree && (
                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>GST (18%)</Text>
                    <Text style={styles.billVal}>₹{gst}</Text>
                  </View>
                )}

                <View style={[styles.billRow, styles.totalBillRow]}>
                  <Text style={styles.totalLabel}>Total Payable</Text>
                  <Text style={styles.totalVal}>
                    {isFree ? '₹0' : `₹${totalAmount.toLocaleString('en-IN')}`}
                  </Text>
                </View>
              </Card>

              {/* Payment Methods (If Paid) */}
              {!isFree && (
                <View style={styles.paymentMethodsSection}>
                  <Text style={styles.sectionTitle}>Select Payment Method</Text>

                  <TouchableOpacity
                    style={[styles.paymentMethodCard, paymentMethod === 'WALLET' && styles.paymentMethodCardActive]}
                    onPress={() => setPaymentMethod('WALLET')}
                  >
                    <MaterialCommunityIcons name="wallet-outline" size={18} color={Colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.paymentMethodTitle}>Tradetron Trading Wallet</Text>
                      <Text style={styles.paymentMethodSub}>Available Balance: ₹25,000</Text>
                    </View>
                    <View style={[styles.radioCircle, paymentMethod === 'WALLET' && styles.radioCircleActive]}>
                      {paymentMethod === 'WALLET' && <View style={styles.radioDot} />}
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.paymentMethodCard, paymentMethod === 'UPI' && styles.paymentMethodCardActive]}
                    onPress={() => setPaymentMethod('UPI')}
                  >
                    <MaterialCommunityIcons name="qrcode-scan" size={18} color={Colors.accentGreen} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.paymentMethodTitle}>Instant UPI (GPay / PhonePe / Paytm)</Text>
                      <Text style={styles.paymentMethodSub}>Zero transaction fees</Text>
                    </View>
                    <View style={[styles.radioCircle, paymentMethod === 'UPI' && styles.radioCircleActive]}>
                      {paymentMethod === 'UPI' && <View style={styles.radioDot} />}
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              {/* Cancellation Policy */}
              <View style={styles.policyRow}>
                <Feather name="info" size={12} color={Colors.textTertiary} />
                <Text style={styles.policyText}>
                  Cancel anytime with 1-click in your profile. Strategy updates & webhook signals delivered in real-time.
                </Text>
              </View>

              {/* Subscribe Trigger Button */}
              <TouchableOpacity
                style={[styles.subscribeBtn, isProcessing && { opacity: 0.7 }]}
                onPress={handleConfirmSubscription}
                disabled={isProcessing}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="flash" size={16} color="#FFFFFF" />
                <Text style={styles.subscribeBtnText}>
                  {isProcessing ? 'Activating License...' : isFree ? 'Subscribe for Free' : `Pay ₹${totalAmount} & Subscribe`}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}
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
  scrollBody: {
    paddingHorizontal: Spacing.md,
  },
  scrollContent: {
    paddingVertical: 14,
    gap: 12,
  },
  stratSummaryCard: {
    padding: 14,
    borderRadius: 14,
    gap: 10,
  },
  stratTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  stratName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  stratCreator: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  categoryBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  stratMetricsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  miniMetric: {
    flex: 1,
    alignItems: 'center',
  },
  miniMetricLabel: {
    fontSize: 9,
    color: Colors.textTertiary,
  },
  miniMetricVal: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 1,
  },
  billingCard: {
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  billLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  billVal: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  totalBillRow: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    marginTop: 2,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  totalVal: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  paymentMethodsSection: {
    gap: 8,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  paymentMethodCardActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(37, 99, 235, 0.04)',
  },
  paymentMethodTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  paymentMethodSub: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    borderColor: Colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  policyText: {
    fontSize: 10,
    color: Colors.textTertiary,
    flex: 1,
    lineHeight: 14,
  },
  subscribeBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    ...Shadows.button,
    marginTop: 4,
  },
  subscribeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  successBox: {
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  successDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  successDetailsCard: {
    width: '100%',
    padding: 12,
    borderRadius: 12,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  detailVal: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  deployNowBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    ...Shadows.button,
  },
  deployNowBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
