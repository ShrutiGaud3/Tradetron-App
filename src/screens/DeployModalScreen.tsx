import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  TextInput,
  Switch,
  Alert 
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme';
import { Strategy, BrokerAccount } from '../types';
import { useAppStore } from '../store/useAppStore';

interface DeployModalScreenProps {
  visible: boolean;
  strategy: Strategy | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const MULTIPLIERS = [1, 2, 3, 5, 10];

export const DeployModalScreen: React.FC<DeployModalScreenProps> = ({
  visible,
  strategy,
  onClose,
  onSuccess,
}) => {
  const brokers = useAppStore((state) => state.brokers);
  const deployStrategyWithConfig = useAppStore((state) => state.deployStrategyWithConfig);

  // Deployment Form State
  const [mode, setMode] = useState<'PAPER' | 'LIVE'>('PAPER');
  const [selectedBrokerId, setSelectedBrokerId] = useState(brokers[0]?.id || '');
  const [isMultiBrokerEnabled, setIsMultiBrokerEnabled] = useState(false);
  const [selectedBrokers, setSelectedBrokers] = useState<Record<string, boolean>>({
    [brokers[0]?.id || '']: true,
  });

  const [multiplier, setMultiplier] = useState(1);
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT' | 'SL_M'>('MARKET');
  const [executionMode, setExecutionMode] = useState<'AUTO' | 'MANUAL_APPROVAL'>('AUTO');
  const [maxLossLimit, setMaxLossLimit] = useState(strategy?.stopLoss ? String(strategy.stopLoss) : '2500');
  const [targetProfitLimit, setTargetProfitLimit] = useState(strategy?.targetProfit ? String(strategy.targetProfit) : '5000');
  const [agreedToRisk, setAgreedToRisk] = useState(false);

  if (!strategy) return null;

  const activeBroker = brokers.find((b) => b.id === selectedBrokerId) || brokers[0];
  const requiredMargin = (strategy.capitalRequired || 100000) * multiplier;
  const availableMargin = activeBroker ? activeBroker.availableFunds : 500000;
  const hasSufficientMargin = mode === 'PAPER' || availableMargin >= requiredMargin;

  const toggleMultiBroker = (brokerId: string) => {
    setSelectedBrokers((prev) => ({
      ...prev,
      [brokerId]: !prev[brokerId],
    }));
  };

  const handleDeploy = () => {
    if (mode === 'LIVE' && !hasSufficientMargin) {
      Alert.alert(
        'Insufficient Margin',
        `Required margin is ₹${requiredMargin.toLocaleString('en-IN')}, but ${activeBroker.brokerName} has ₹${availableMargin.toLocaleString('en-IN')} available. Please reduce multiplier or add funds.`
      );
      return;
    }

    if (!agreedToRisk) {
      Alert.alert('Risk Acknowledgement', 'Please check the acknowledgement box for algo automated risk limits before deploying.');
      return;
    }

    // Prepare multi-broker list if enabled
    const multiBrokersList = isMultiBrokerEnabled
      ? brokers
          .filter((b) => selectedBrokers[b.id])
          .map((b) => ({
            brokerId: b.id,
            brokerName: b.brokerName,
            multiplier,
          }))
      : undefined;

    deployStrategyWithConfig({
      strategyId: strategy.id,
      mode,
      brokerId: selectedBrokerId,
      multiplier,
      orderType,
      executionMode,
      maxLossLimit: parseFloat(maxLossLimit) || undefined,
      targetProfitLimit: parseFloat(targetProfitLimit) || undefined,
      multiBrokers: multiBrokersList,
    });

    onClose();
    Alert.alert(
      'Strategy Deployed! 🚀',
      `"${strategy.name}" is now live in ${mode} mode with ${multiplier}x sizing (${strategy.legs.length} legs active).`
    );
    if (onSuccess) onSuccess();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Deploy Algo Strategy</Text>
              <Text style={styles.strategyName}>{strategy.name}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.body} contentContainerStyle={styles.bodyContent}>
            {/* Step 1: Mode Selector (Paper vs Live) */}
            <Text style={styles.sectionLabel}>1. Execution Mode</Text>
            <View style={styles.modeToggleRow}>
              <TouchableOpacity 
                style={[styles.modeCard, mode === 'PAPER' && styles.modeCardActivePaper]}
                onPress={() => setMode('PAPER')}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons 
                  name="shield-check-outline" 
                  size={20} 
                  color={mode === 'PAPER' ? Colors.accentPurple : Colors.textTertiary} 
                />
                <Text style={[styles.modeTitle, mode === 'PAPER' && { color: Colors.accentPurple }]}>
                  Virtual Paper
                </Text>
                <Text style={styles.modeDesc}>Risk-free simulated market fill engine</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modeCard, mode === 'LIVE' && styles.modeCardActiveLive]}
                onPress={() => setMode('LIVE')}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons 
                  name="lightning-bolt" 
                  size={20} 
                  color={mode === 'LIVE' ? Colors.accentGreen : Colors.textTertiary} 
                />
                <Text style={[styles.modeTitle, mode === 'LIVE' && { color: Colors.accentGreen }]}>
                  Live Trading
                </Text>
                <Text style={styles.modeDesc}>Real-money execution via connected broker API</Text>
              </TouchableOpacity>
            </View>

            {/* Step 2: Broker Account Routing */}
            {mode === 'LIVE' && (
              <View style={styles.brokerSection}>
                <View style={styles.brokerSectionHeader}>
                  <Text style={styles.sectionLabel}>2. Select Broker Account</Text>
                  <View style={styles.multiBrokerToggle}>
                    <Text style={styles.multiBrokerText}>Multi-Broker Split</Text>
                    <Switch
                      value={isMultiBrokerEnabled}
                      onValueChange={setIsMultiBrokerEnabled}
                      trackColor={{ false: '#D0D8E8', true: Colors.primary }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                </View>

                {isMultiBrokerEnabled ? (
                  <View style={styles.multiBrokerList}>
                    {brokers.map((broker) => {
                      const isChecked = !!selectedBrokers[broker.id];
                      return (
                        <TouchableOpacity
                          key={broker.id}
                          style={[styles.brokerSelectCard, isChecked && styles.brokerSelectCardActive]}
                          onPress={() => toggleMultiBroker(broker.id)}
                        >
                          <View style={styles.brokerInfoLeft}>
                            <MaterialCommunityIcons 
                              name={isChecked ? "checkbox-marked" : "checkbox-blank-outline"} 
                              size={20} 
                              color={isChecked ? Colors.primary : Colors.textTertiary} 
                            />
                            <View style={{ marginLeft: 8 }}>
                              <Text style={styles.brokerNameTxt}>{broker.brokerName}</Text>
                              <Text style={styles.brokerAccountTxt}>{broker.accountRef} • {broker.pingLatencyMs}ms ping</Text>
                            </View>
                          </View>
                          <Text style={styles.brokerFundTxt}>₹{(broker.availableFunds / 1000).toFixed(0)}k</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : (
                  <View style={styles.brokerList}>
                    {brokers.map((broker) => {
                      const isSelected = selectedBrokerId === broker.id;
                      return (
                        <TouchableOpacity
                          key={broker.id}
                          style={[styles.brokerSelectCard, isSelected && styles.brokerSelectCardActive]}
                          onPress={() => setSelectedBrokerId(broker.id)}
                        >
                          <View style={styles.brokerInfoLeft}>
                            <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                              {isSelected && <View style={styles.radioInner} />}
                            </View>
                            <View style={{ marginLeft: 8 }}>
                              <Text style={styles.brokerNameTxt}>{broker.brokerName}</Text>
                              <Text style={styles.brokerAccountTxt}>{broker.accountRef} • {broker.pingLatencyMs}ms ping</Text>
                            </View>
                          </View>
                          <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.brokerFundTxt}>₹{broker.availableFunds.toLocaleString('en-IN')}</Text>
                            <Text style={styles.brokerFundLabel}>Available Margin</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            )}

            {/* Step 3: Multiplier & Capital Sizing */}
            <Text style={styles.sectionLabel}>3. Position Multiplier & Sizing</Text>
            <View style={styles.multiplierContainer}>
              <View style={styles.multiplierRow}>
                {MULTIPLIERS.map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.multBtn, multiplier === m && styles.multBtnActive]}
                    onPress={() => setMultiplier(m)}
                  >
                    <Text style={[styles.multBtnText, multiplier === m && styles.multBtnTextActive]}>
                      {m}x
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Live Margin Estimation Box */}
              <View style={[styles.marginEstimateBox, !hasSufficientMargin && styles.marginWarningBox]}>
                <View style={styles.marginRow}>
                  <Text style={styles.marginLabel}>Required Margin:</Text>
                  <Text style={styles.marginVal}>₹{requiredMargin.toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.marginRow}>
                  <Text style={styles.marginLabel}>Available Balance:</Text>
                  <Text style={styles.marginVal}>
                    {mode === 'PAPER' ? '₹10,00,000 (Virtual)' : `₹${availableMargin.toLocaleString('en-IN')}`}
                  </Text>
                </View>
                <View style={styles.marginDivider} />
                <View style={styles.marginStatusRow}>
                  <Feather 
                    name={hasSufficientMargin ? "check-circle" : "alert-triangle"} 
                    size={13} 
                    color={hasSufficientMargin ? Colors.accentGreen : Colors.accentCoral} 
                  />
                  <Text style={[styles.marginStatusTxt, { color: hasSufficientMargin ? Colors.accentGreen : Colors.accentCoral }]}>
                    {hasSufficientMargin ? 'Margin Buffer Sufficient' : 'Insufficient Broker Margin!'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Step 4: Order Execution Settings */}
            <Text style={styles.sectionLabel}>4. Execution Settings</Text>
            <View style={styles.settingsGrid}>
              <View style={styles.settingCol}>
                <Text style={styles.settingSubLabel}>Order Type</Text>
                <View style={styles.pillGroup}>
                  {(['MARKET', 'LIMIT', 'SL_M'] as const).map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.smallPill, orderType === t && styles.smallPillActive]}
                      onPress={() => setOrderType(t)}
                    >
                      <Text style={[styles.smallPillText, orderType === t && styles.smallPillTextActive]}>
                        {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.settingCol}>
                <Text style={styles.settingSubLabel}>Approval Mode</Text>
                <View style={styles.pillGroup}>
                  {(['AUTO', 'MANUAL_APPROVAL'] as const).map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={[styles.smallPill, executionMode === m && styles.smallPillActive]}
                      onPress={() => setExecutionMode(m)}
                    >
                      <Text style={[styles.smallPillText, executionMode === m && styles.smallPillTextActive]}>
                        {m === 'AUTO' ? 'Full Auto' : 'Manual Ack'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Step 5: Risk Limit Controls */}
            <View style={styles.riskRow}>
              <View style={[styles.riskInputWrap, { flex: 1 }]}>
                <Text style={styles.settingSubLabel}>Max Loss Stop (₹)</Text>
                <TextInput
                  style={styles.riskInput}
                  keyboardType="numeric"
                  value={maxLossLimit}
                  onChangeText={setMaxLossLimit}
                />
              </View>
              <View style={[styles.riskInputWrap, { flex: 1 }]}>
                <Text style={styles.settingSubLabel}>Target Profit (₹)</Text>
                <TextInput
                  style={styles.riskInput}
                  keyboardType="numeric"
                  value={targetProfitLimit}
                  onChangeText={setTargetProfitLimit}
                />
              </View>
            </View>

            {/* Disclaimer Checkbox */}
            <TouchableOpacity 
              style={styles.disclaimerRow} 
              onPress={() => setAgreedToRisk(!agreedToRisk)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons 
                name={agreedToRisk ? "checkbox-marked" : "checkbox-blank-outline"} 
                size={18} 
                color={agreedToRisk ? Colors.primary : Colors.textTertiary} 
              />
              <Text style={styles.disclaimerText}>
                I understand algo trading carries market risk and acknowledge configured stop-loss rules.
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Deploy CTA Button */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[
                styles.deployButton, 
                mode === 'LIVE' && styles.deployButtonLive,
                (!agreedToRisk || !hasSufficientMargin) && styles.deployButtonDisabled
              ]}
              onPress={handleDeploy}
              disabled={!agreedToRisk || !hasSufficientMargin}
            >
              <MaterialCommunityIcons 
                name={mode === 'LIVE' ? "lightning-bolt" : "rocket-launch"} 
                size={18} 
                color="#FFFFFF" 
                style={{ marginRight: 6 }}
              />
              <Text style={styles.deployButtonText}>
                {mode === 'LIVE' ? `Deploy Live via ${activeBroker.brokerName}` : 'Deploy Paper Simulation'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 25, 47, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '92%',
    paddingBottom: Spacing.lg,
    ...Shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30, 80, 220, 0.12)',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  strategyName: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 6,
  },
  body: {
    paddingHorizontal: Spacing.md,
  },
  bodyContent: {
    paddingVertical: Spacing.sm,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
    marginTop: 8,
  },
  modeToggleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  modeCard: {
    flex: 1,
    backgroundColor: 'rgba(240, 246, 255, 0.85)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1.2,
    borderColor: 'rgba(30, 80, 220, 0.18)',
    padding: Spacing.sm,
    alignItems: 'center',
  },
  modeCardActivePaper: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderColor: Colors.accentPurple,
  },
  modeCardActiveLive: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: Colors.accentGreen,
  },
  modeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  modeDesc: {
    fontSize: 9.5,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: 2,
  },
  brokerSection: {
    marginBottom: Spacing.md,
  },
  brokerSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  multiBrokerToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  multiBrokerText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  brokerList: {
    gap: 6,
  },
  multiBrokerList: {
    gap: 6,
  },
  brokerSelectCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 248, 255, 0.9)',
    borderWidth: 1.2,
    borderColor: 'rgba(30, 80, 220, 0.18)',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  brokerSelectCardActive: {
    backgroundColor: 'rgba(235, 243, 255, 0.95)',
    borderColor: Colors.primary,
  },
  brokerInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.textTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  brokerNameTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  brokerAccountTxt: {
    fontSize: 9.5,
    color: Colors.textTertiary,
  },
  brokerFundTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  brokerFundLabel: {
    fontSize: 9,
    color: Colors.textTertiary,
  },
  multiplierContainer: {
    marginBottom: Spacing.md,
  },
  multiplierRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  multBtn: {
    flex: 1,
    backgroundColor: 'rgba(240, 246, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(30, 80, 220, 0.18)',
    borderRadius: BorderRadius.md,
    paddingVertical: 8,
    alignItems: 'center',
  },
  multBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  multBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  multBtnTextActive: {
    color: '#FFFFFF',
  },
  marginEstimateBox: {
    backgroundColor: 'rgba(235, 243, 255, 0.85)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(30, 80, 220, 0.2)',
    padding: Spacing.sm,
  },
  marginWarningBox: {
    backgroundColor: 'rgba(250, 90, 90, 0.1)',
    borderColor: Colors.accentCoral,
  },
  marginRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  marginLabel: {
    fontSize: 10.5,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  marginVal: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  marginDivider: {
    height: 1,
    backgroundColor: 'rgba(30, 80, 220, 0.12)',
    marginVertical: 4,
  },
  marginStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  marginStatusTxt: {
    fontSize: 10,
    fontWeight: '700',
  },
  settingsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  settingCol: {
    flex: 1,
  },
  settingSubLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  pillGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  smallPill: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(30, 80, 220, 0.18)',
    borderRadius: BorderRadius.sm,
    paddingVertical: 6,
    alignItems: 'center',
  },
  smallPillActive: {
    backgroundColor: Colors.textPrimary,
    borderColor: Colors.textPrimary,
  },
  smallPillText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  smallPillTextActive: {
    color: '#FFFFFF',
  },
  riskRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  riskInputWrap: {
    flex: 1,
  },
  riskInput: {
    backgroundColor: 'rgba(245, 248, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(30, 80, 220, 0.2)',
    borderRadius: BorderRadius.md,
    height: 36,
    paddingHorizontal: 8,
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(240, 246, 255, 0.6)',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 10,
    color: Colors.textSecondary,
    lineHeight: 14,
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
  },
  deployButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 13,
    ...Shadows.button,
  },
  deployButtonLive: {
    backgroundColor: Colors.accentGreen,
  },
  deployButtonDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.7,
  },
  deployButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
