import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Shadows } from '../../theme';
import { Card } from '../common/Card';
import { useAppStore } from '../../store/useAppStore';
import { Strategy } from '../../types';

interface PublishStrategyModalProps {
  visible: boolean;
  onClose: () => void;
  initialStrategy?: Strategy | null;
}

export const PublishStrategyModal: React.FC<PublishStrategyModalProps> = ({
  visible,
  onClose,
  initialStrategy,
}) => {
  const publishStrategyToMarketplace = useAppStore((state) => state.publishStrategyToMarketplace);

  const [name, setName] = useState(initialStrategy?.name || '');
  const [description, setDescription] = useState(
    initialStrategy?.description || ''
  );
  const [category, setCategory] = useState<Strategy['category']>(
    initialStrategy?.category || 'Options Selling'
  );
  const [pricingModel, setPricingModel] = useState<'FREE' | 'FLAT' | 'PROFIT_SHARE'>('FLAT');
  const [monthlyPrice, setMonthlyPrice] = useState('999');
  const [profitSharePct, setProfitSharePct] = useState('15');
  const [minCapital, setMinCapital] = useState(
    initialStrategy ? `${initialStrategy.capitalRequired}` : '100000'
  );
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [isPublishedSuccess, setIsPublishedSuccess] = useState(false);

  const handlePublish = () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter a strategy name.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please enter a brief strategy description.');
      return;
    }
    if (!disclaimerAccepted) {
      Alert.alert('SEBI Compliance Required', 'You must accept the SEBI compliance and risk disclaimer before publishing.');
      return;
    }

    const price = pricingModel === 'FREE' ? 0 : parseInt(monthlyPrice, 10) || 499;

    publishStrategyToMarketplace({
      name: name.trim(),
      description: description.trim(),
      category,
      capitalRequired: parseInt(minCapital, 10) || 50000,
      pricingMonthly: price,
      underlying: initialStrategy?.underlying || ['NIFTY'],
      timeframe: initialStrategy?.timeframe || '5m',
      conditions: initialStrategy?.conditions || [],
      legs: initialStrategy?.legs || [],
      winRate: initialStrategy?.winRate || 69.4,
      cagr: initialStrategy?.cagr || 46.2,
      maxDrawdown: initialStrategy?.maxDrawdown || -8.2,
      sharpeRatio: initialStrategy?.sharpeRatio || 1.9,
    });

    setIsPublishedSuccess(true);
  };

  const handleDone = () => {
    setIsPublishedSuccess(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconContainer}>
                <MaterialCommunityIcons name="storefront-outline" size={20} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Creator Studio</Text>
                <Text style={styles.headerSubtitle}>Monetize & Publish to Marketplace</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.closeBtn} 
              onPress={isPublishedSuccess ? handleDone : onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="x" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {isPublishedSuccess ? (
            <View style={styles.successContainer}>
              <View style={styles.successIconCircle}>
                <MaterialCommunityIcons name="check-decagram" size={48} color={Colors.accentGreen} />
              </View>
              <Text style={styles.successTitle}>Strategy Published Live!</Text>
              <Text style={styles.successDesc}>
                "{name}" is now listed on the Tradetron Public Marketplace. Traders across India can discover, subscribe, and 1-click deploy your algo.
              </Text>

              <Card style={styles.payoutEstimateCard} variant="blueGlass">
                <Text style={styles.payoutEstimateLabel}>Potential Creator Earnings</Text>
                <Text style={styles.payoutEstimateValue}>
                  {pricingModel === 'FREE' 
                    ? 'Free / Reputation Building' 
                    : `₹${((parseInt(monthlyPrice, 10) || 999) * 50).toLocaleString('en-IN')}/mo with 50 subscribers`}
                </Text>
                <Text style={styles.payoutEstimateSub}>
                  Payouts transferred automatically via IMPS every 1st & 15th of the month.
                </Text>
              </Card>

              <TouchableOpacity style={styles.primaryDoneBtn} onPress={handleDone} activeOpacity={0.8}>
                <Text style={styles.primaryDoneBtnText}>Go to Marketplace</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView 
              style={styles.scrollBody} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Strategy Name & Description */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Strategy Title *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., NIFTY 0-DTE Momentum Hunter"
                  placeholderTextColor={Colors.textTertiary}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Public Description & Edge *</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Explain your market edge, risk parameters, and recommended capital..."
                  placeholderTextColor={Colors.textTertiary}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Category Selector */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Strategy Category</Text>
                <View style={styles.pillsRow}>
                  {(['Options Selling', 'Options Buying', 'Intraday Trend', 'Scalping'] as const).map((cat) => {
                    const isSelected = category === cat;
                    return (
                      <TouchableOpacity
                        key={cat}
                        style={[styles.catPill, isSelected && styles.catPillActive]}
                        onPress={() => setCategory(cat)}
                      >
                        <Text style={[styles.catPillText, isSelected && styles.catPillTextActive]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Minimum Capital Requirement */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Recommended Capital (₹)</Text>
                <View style={styles.currencyInputRow}>
                  <Text style={styles.currencyPrefix}>₹</Text>
                  <TextInput
                    style={styles.currencyInput}
                    keyboardType="numeric"
                    placeholder="100000"
                    placeholderTextColor={Colors.textTertiary}
                    value={minCapital}
                    onChangeText={setMinCapital}
                  />
                </View>
              </View>

              {/* Pricing & Monetization Model */}
              <Card style={styles.pricingCard} variant="blueGlass">
                <Text style={styles.sectionHeader}>Monetization Model</Text>
                
                <View style={styles.pricingTabs}>
                  <TouchableOpacity
                    style={[styles.pricingTab, pricingModel === 'FLAT' && styles.pricingTabActive]}
                    onPress={() => setPricingModel('FLAT')}
                  >
                    <Feather name="credit-card" size={14} color={pricingModel === 'FLAT' ? '#FFFFFF' : Colors.textSecondary} />
                    <Text style={[styles.pricingTabText, pricingModel === 'FLAT' && styles.pricingTabTextActive]}>
                      Monthly Flat
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.pricingTab, pricingModel === 'PROFIT_SHARE' && styles.pricingTabActive]}
                    onPress={() => setPricingModel('PROFIT_SHARE')}
                  >
                    <Feather name="percent" size={14} color={pricingModel === 'PROFIT_SHARE' ? '#FFFFFF' : Colors.textSecondary} />
                    <Text style={[styles.pricingTabText, pricingModel === 'PROFIT_SHARE' && styles.pricingTabTextActive]}>
                      Profit Share
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.pricingTab, pricingModel === 'FREE' && styles.pricingTabActive]}
                    onPress={() => setPricingModel('FREE')}
                  >
                    <Feather name="gift" size={14} color={pricingModel === 'FREE' ? '#FFFFFF' : Colors.textSecondary} />
                    <Text style={[styles.pricingTabText, pricingModel === 'FREE' && styles.pricingTabTextActive]}>
                      Free (0₹)
                    </Text>
                  </TouchableOpacity>
                </View>

                {pricingModel === 'FLAT' && (
                  <View style={styles.priceSelectorRow}>
                    {['499', '999', '1499', '2499'].map((p) => (
                      <TouchableOpacity
                        key={p}
                        style={[styles.quickPriceBtn, monthlyPrice === p && styles.quickPriceBtnActive]}
                        onPress={() => setMonthlyPrice(p)}
                      >
                        <Text style={[styles.quickPriceText, monthlyPrice === p && styles.quickPriceTextActive]}>
                          ₹{p}/mo
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {pricingModel === 'PROFIT_SHARE' && (
                  <View style={styles.profitShareBox}>
                    <Text style={styles.profitShareLabel}>Share of Monthly Net Profit</Text>
                    <View style={styles.priceSelectorRow}>
                      {['10', '15', '20'].map((pct) => (
                        <TouchableOpacity
                          key={pct}
                          style={[styles.quickPriceBtn, profitSharePct === pct && styles.quickPriceBtnActive]}
                          onPress={() => setProfitSharePct(pct)}
                        >
                          <Text style={[styles.quickPriceText, profitSharePct === pct && styles.quickPriceTextActive]}>
                            {pct}% Cut
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <Text style={styles.profitShareSub}>Billed automatically via Tradetron Escrow upon month-end ledger settlement.</Text>
                  </View>
                )}
              </Card>

              {/* SEBI Compliance & Risk Disclaimer */}
              <View style={styles.complianceBox}>
                <View style={styles.complianceRow}>
                  <Switch
                    value={disclaimerAccepted}
                    onValueChange={setDisclaimerAccepted}
                    trackColor={{ false: '#CBD5E1', true: Colors.primary }}
                    thumbColor="#FFFFFF"
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.complianceTitle}>SEBI Disclaimer & Code of Conduct</Text>
                    <Text style={styles.complianceText}>
                      I acknowledge that I am not offering guaranteed return schemes. Subscribers execute trades in their own broker accounts with their own risk parameters.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Publish Action Button */}
              <TouchableOpacity 
                style={[styles.publishBtn, !disclaimerAccepted && styles.publishBtnDisabled]} 
                onPress={handlePublish}
                activeOpacity={0.8}
                disabled={!disclaimerAccepted}
              >
                <MaterialCommunityIcons name="rocket-launch" size={16} color="#FFFFFF" />
                <Text style={styles.publishBtnText}>Publish Algo to Marketplace</Text>
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
    paddingBottom: 20,
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
  scrollBody: {
    paddingHorizontal: Spacing.md,
  },
  scrollContent: {
    paddingVertical: 14,
    gap: 12,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  textArea: {
    height: 72,
    textAlignVertical: 'top',
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  catPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  catPillText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  catPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  currencyInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
  },
  currencyPrefix: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginRight: 6,
  },
  currencyInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  pricingCard: {
    padding: 12,
    borderRadius: 14,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  pricingTabs: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  pricingTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pricingTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pricingTabText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  pricingTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  priceSelectorRow: {
    flexDirection: 'row',
    gap: 6,
  },
  quickPriceBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickPriceBtnActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    borderColor: Colors.primary,
  },
  quickPriceText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  quickPriceTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  profitShareBox: {
    gap: 6,
  },
  profitShareLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  profitShareSub: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  complianceBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  complianceRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  complianceTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  complianceText: {
    fontSize: 10,
    color: Colors.textSecondary,
    lineHeight: 14,
    marginTop: 2,
  },
  publishBtn: {
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
  publishBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  publishBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  successContainer: {
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
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
  payoutEstimateCard: {
    width: '100%',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    gap: 4,
  },
  payoutEstimateLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  payoutEstimateValue: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  payoutEstimateSub: {
    fontSize: 10,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: 2,
  },
  primaryDoneBtn: {
    backgroundColor: Colors.primary,
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryDoneBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
