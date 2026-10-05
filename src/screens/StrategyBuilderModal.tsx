import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  TextInput,
  Alert,
  Dimensions,
  Switch
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { Strategy, StrategyCondition, StrategyLeg, BacktestResult } from '../types';
import { ConditionBlock } from '../components/strategy/ConditionBlock';
import { OptionLegRow } from '../components/strategy/OptionLegRow';
import { BacktestReportModal } from '../components/strategy/BacktestReportModal';
import { BacktestEngine } from '../services/backtestEngine';

interface StrategyBuilderModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenDeploy?: (strategy: Strategy) => void;
}

type TabType = 'BASICS' | 'ENTRY_LOGIC' | 'OPTION_LEGS' | 'RISK_RULES';

const UNDERLYING_OPTIONS = ['NIFTY 50', 'BANKNIFTY', 'FINNIFTY', 'SENSEX'];
const TIMEFRAMES = ['1m', '3m', '5m', '15m', '1h', '1d'];
const CATEGORIES: Array<Strategy['category']> = [
  'Options Selling',
  'Options Buying',
  'Intraday Trend',
  'Scalping',
  'Directional',
];

export const StrategyBuilderModal: React.FC<StrategyBuilderModalProps> = ({
  visible,
  onClose,
  onOpenDeploy,
}) => {
  const addStrategy = useAppStore((state) => state.addStrategy);

  // Tab State
  const [activeTab, setActiveTab] = useState<TabType>('BASICS');

  // Step 1: Basics
  const [strategyName, setStrategyName] = useState('');
  const [description, setDescription] = useState('');
  const [underlying, setUnderlying] = useState<string>('NIFTY 50');
  const [timeframe, setTimeframe] = useState<string>('5m');
  const [category, setCategory] = useState<Strategy['category']>('Options Selling');
  const [capitalRequired, setCapitalRequired] = useState('150000');

  // Step 2: Entry Conditions
  const [conditions, setConditions] = useState<StrategyCondition[]>([
    {
      id: 'cond_1',
      leftOperand: 'RSI(14)',
      operator: 'crosses_above',
      rightOperand: '60',
    },
    {
      id: 'cond_2',
      leftOperand: 'Supertrend(7,3)',
      operator: '==',
      rightOperand: 'GREEN',
    },
  ]);
  const [connector, setConnector] = useState<'AND' | 'OR'>('AND');

  // Step 3: Option & Futures Legs
  const [legs, setLegs] = useState<StrategyLeg[]>([
    {
      id: 'leg_1',
      instrument: 'NIFTY 50',
      segment: 'OPT',
      optionType: 'CE',
      strikeOffset: 'ATM',
      expiry: 'CURRENT_WEEK',
      action: 'SELL',
      lots: 1,
      targetPercent: 35,
      stopLossPercent: 20,
    },
    {
      id: 'leg_2',
      instrument: 'NIFTY 50',
      segment: 'OPT',
      optionType: 'PE',
      strikeOffset: 'ATM',
      expiry: 'CURRENT_WEEK',
      action: 'SELL',
      lots: 1,
      targetPercent: 35,
      stopLossPercent: 20,
    },
  ]);

  // Step 4: Risk & Automation
  const [targetProfit, setTargetProfit] = useState('4000');
  const [stopLoss, setStopLoss] = useState('2000');
  const [trailingSlEnabled, setTrailingSlEnabled] = useState(true);
  const [trailingLockAt, setTrailingLockAt] = useState('1500');
  const [trailingStep, setTrailingStep] = useState('500');
  const [startTime, setStartTime] = useState('09:20');
  const [squareOffTime, setSquareOffTime] = useState('15:15');
  const [maxReentries, setMaxReentries] = useState('2');

  // Backtest Simulation State
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [backtestModalVisible, setBacktestModalVisible] = useState(false);

  // Handlers for Conditions
  const handleAddCondition = () => {
    setConditions([
      ...conditions,
      {
        id: `cond_${Date.now()}`,
        leftOperand: 'EMA(20)',
        operator: '>',
        rightOperand: 'Candle Close[-1]',
      },
    ]);
  };

  const handleUpdateCondition = (index: number, updated: Partial<StrategyCondition>) => {
    const updatedList = [...conditions];
    updatedList[index] = { ...updatedList[index], ...updated };
    setConditions(updatedList);
  };

  const handleRemoveCondition = (index: number) => {
    setConditions(conditions.filter((_, idx) => idx !== index));
  };

  // Handlers for Legs
  const handleAddLeg = () => {
    setLegs([
      ...legs,
      {
        id: `leg_${Date.now()}`,
        instrument: underlying,
        segment: 'OPT',
        optionType: 'CE',
        strikeOffset: 'OTM1',
        expiry: 'CURRENT_WEEK',
        action: 'BUY',
        lots: 1,
        targetPercent: 50,
        stopLossPercent: 25,
      },
    ]);
  };

  const handleUpdateLeg = (index: number, updated: Partial<StrategyLeg>) => {
    const updatedList = [...legs];
    updatedList[index] = { ...updatedList[index], ...updated };
    setLegs(updatedList);
  };

  const handleRemoveLeg = (index: number) => {
    setLegs(legs.filter((_, idx) => idx !== index));
  };

  // Construct Strategy Object
  const getCompiledStrategy = (): Strategy => {
    return {
      id: `strat_custom_${Date.now()}`,
      name: strategyName.trim() || `${underlying} ${timeframe} Custom Algo`,
      description: description.trim() || `Automated ${category} strategy built on ${underlying} (${timeframe}) with ${legs.length} legs.`,
      creatorName: 'You (Quant Studio)',
      category,
      underlying: [underlying],
      timeframe,
      version: 'v1.0',
      status: 'ACTIVE',
      capitalRequired: parseFloat(capitalRequired) || 100000,
      winRate: 72.4,
      cagr: 42.8,
      maxDrawdown: 9.4,
      sharpeRatio: 2.35,
      subscribersCount: 1,
      pricingMonthly: 0,
      isSubscribed: true,
      conditions,
      legs,
      targetProfit: parseFloat(targetProfit) || undefined,
      stopLoss: parseFloat(stopLoss) || undefined,
      trailingSl: trailingSlEnabled ? { activateAt: parseFloat(trailingLockAt) || 1000, trailBy: parseFloat(trailingStep) || 500 } : undefined,
      startTime,
      squareOffTime,
      maxReentries: parseInt(maxReentries, 10) || 1,
    };
  };

  // Run Backtest
  const handleRunBacktest = () => {
    const strat = getCompiledStrategy();
    const result = BacktestEngine.runBacktest(strat, '6M');
    setBacktestResult(result);
    setBacktestModalVisible(true);
  };

  // Save Strategy to Zustand
  const handleSaveStrategy = () => {
    if (!strategyName.trim()) {
      Alert.alert('Name Required', 'Please enter a name for your custom algo strategy.');
      return;
    }

    const strat = getCompiledStrategy();
    addStrategy(strat);

    Alert.alert(
      'Strategy Saved! 🚀',
      `"${strat.name}" has been compiled and saved to "My Algos". You can now deploy it in Paper or Live mode.`,
      [
        { text: 'Done', onPress: onClose },
        { 
          text: 'Deploy Now', 
          onPress: () => {
            onClose();
            if (onOpenDeploy) {
              setTimeout(() => onOpenDeploy(strat), 200);
            }
          } 
        }
      ]
    );
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="lightning-bolt" size={20} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.title}>No-Code Strategy Builder</Text>
                <Text style={styles.subtitle}>Module 4 • Visual Rule & Options Engine</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* 4 Tabs Bar */}
          <View style={styles.tabsBar}>
            {[
              { key: 'BASICS', label: '1. Basics', icon: 'tune' },
              { key: 'ENTRY_LOGIC', label: '2. Logic Rules', icon: 'code-braces' },
              { key: 'OPTION_LEGS', label: '3. Multi-Legs', icon: 'layers-outline' },
              { key: 'RISK_RULES', label: '4. Risk & Hours', icon: 'shield-check-outline' },
            ].map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                  onPress={() => setActiveTab(tab.key as TabType)}
                >
                  <Text style={[styles.tabBtnText, isActive && styles.tabBtnTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Tab Content Body */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* TAB 1: BASICS */}
            {activeTab === 'BASICS' && (
              <View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Strategy Name</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. NIFTY Supertrend 5m Straddle"
                    placeholderTextColor={Colors.textTertiary}
                    value={strategyName}
                    onChangeText={setStrategyName}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Description / Thesis</Text>
                  <TextInput
                    style={[styles.textInput, { height: 50 }]}
                    multiline
                    placeholder="e.g. Sells ATM straddle on RSI momentum confirmation with 20% SL."
                    placeholderTextColor={Colors.textTertiary}
                    value={description}
                    onChangeText={setDescription}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Underlying Index</Text>
                  <View style={styles.pillRow}>
                    {UNDERLYING_OPTIONS.map((u) => (
                      <TouchableOpacity
                        key={u}
                        style={[styles.pill, underlying === u && styles.pillActive]}
                        onPress={() => setUnderlying(u)}
                      >
                        <Text style={[styles.pillText, underlying === u && styles.pillTextActive]}>
                          {u}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.twoCol}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Candle Timeframe</Text>
                    <View style={styles.pillRow}>
                      {TIMEFRAMES.slice(0, 4).map((tf) => (
                        <TouchableOpacity
                          key={tf}
                          style={[styles.pillSmall, timeframe === tf && styles.pillActive]}
                          onPress={() => setTimeframe(tf)}
                        >
                          <Text style={[styles.pillText, timeframe === tf && styles.pillTextActive]}>
                            {tf}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Capital Required (₹)</Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      value={capitalRequired}
                      onChangeText={setCapitalRequired}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Strategy Category</Text>
                  <View style={styles.pillRow}>
                    {CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[styles.pill, category === cat && styles.pillActive]}
                        onPress={() => setCategory(cat)}
                      >
                        <Text style={[styles.pillText, category === cat && styles.pillTextActive]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* TAB 2: LOGIC RULES */}
            {activeTab === 'ENTRY_LOGIC' && (
              <View>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <Text style={styles.sectionTitle}>Entry Trigger Conditions</Text>
                    <Text style={styles.sectionSub}>All conditions evaluated in real-time on candle close</Text>
                  </View>
                  <TouchableOpacity style={styles.addBtn} onPress={handleAddCondition}>
                    <Feather name="plus" size={14} color="#FFFFFF" />
                    <Text style={styles.addBtnText}>Add Rule</Text>
                  </TouchableOpacity>
                </View>

                {conditions.map((cond, index) => (
                  <ConditionBlock
                    key={cond.id}
                    condition={cond}
                    index={index}
                    totalConditions={conditions.length}
                    connector={connector}
                    onConnectorChange={setConnector}
                    onUpdate={(upd) => handleUpdateCondition(index, upd)}
                    onRemove={() => handleRemoveCondition(index)}
                  />
                ))}
              </View>
            )}

            {/* TAB 3: OPTION LEGS */}
            {activeTab === 'OPTION_LEGS' && (
              <View>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <Text style={styles.sectionTitle}>Order Position Legs</Text>
                    <Text style={styles.sectionSub}>Configure Multi-Leg options, strike offsets and lots</Text>
                  </View>
                  <TouchableOpacity style={styles.addBtn} onPress={handleAddLeg}>
                    <Feather name="plus" size={14} color="#FFFFFF" />
                    <Text style={styles.addBtnText}>Add Leg</Text>
                  </TouchableOpacity>
                </View>

                {legs.map((leg, index) => (
                  <OptionLegRow
                    key={leg.id}
                    leg={leg}
                    index={index}
                    totalLegs={legs.length}
                    onUpdate={(upd) => handleUpdateLeg(index, upd)}
                    onRemove={() => handleRemoveLeg(index)}
                  />
                ))}
              </View>
            )}

            {/* TAB 4: RISK & HOURS */}
            {activeTab === 'RISK_RULES' && (
              <View>
                <View style={styles.riskCard}>
                  <Text style={styles.riskCardTitle}>Strategy Level Risk Controls</Text>

                  <View style={styles.twoCol}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.label}>Target Profit (₹)</Text>
                      <TextInput
                        style={styles.textInput}
                        keyboardType="numeric"
                        value={targetProfit}
                        onChangeText={setTargetProfit}
                        placeholder="e.g. 5000"
                        placeholderTextColor={Colors.textTertiary}
                      />
                    </View>

                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.label}>Max Stop Loss (₹)</Text>
                      <TextInput
                        style={styles.textInput}
                        keyboardType="numeric"
                        value={stopLoss}
                        onChangeText={setStopLoss}
                        placeholder="e.g. 2500"
                        placeholderTextColor={Colors.textTertiary}
                      />
                    </View>
                  </View>

                  <View style={styles.divider} />

                  {/* Trailing Stop Loss Toggle */}
                  <View style={styles.switchRow}>
                    <View>
                      <Text style={styles.switchLabel}>Trailing Stop Loss</Text>
                      <Text style={styles.switchSub}>Lock profit dynamically as price moves</Text>
                    </View>
                    <Switch
                      value={trailingSlEnabled}
                      onValueChange={setTrailingSlEnabled}
                      trackColor={{ false: '#D0D8E8', true: Colors.primary }}
                      thumbColor="#FFFFFF"
                    />
                  </View>

                  {trailingSlEnabled && (
                    <View style={styles.twoCol}>
                      <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Lock at Profit (₹)</Text>
                        <TextInput
                          style={styles.textInput}
                          keyboardType="numeric"
                          value={trailingLockAt}
                          onChangeText={setTrailingLockAt}
                        />
                      </View>
                      <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Trail Step (₹)</Text>
                        <TextInput
                          style={styles.textInput}
                          keyboardType="numeric"
                          value={trailingStep}
                          onChangeText={setTrailingStep}
                        />
                      </View>
                    </View>
                  )}
                </View>

                {/* Execution Timing */}
                <View style={styles.riskCard}>
                  <Text style={styles.riskCardTitle}>Trading Session Hours</Text>
                  
                  <View style={styles.twoCol}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.label}>Start Time (IST)</Text>
                      <TextInput
                        style={styles.textInput}
                        value={startTime}
                        onChangeText={setStartTime}
                      />
                    </View>

                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.label}>Auto Square-Off (IST)</Text>
                      <TextInput
                        style={styles.textInput}
                        value={squareOffTime}
                        onChangeText={setSquareOffTime}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Max Re-entries Per Day</Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      value={maxReentries}
                      onChangeText={setMaxReentries}
                    />
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.backtestBtn} onPress={handleRunBacktest}>
              <MaterialCommunityIcons name="chart-bell-curve-cumulative" size={16} color={Colors.primary} style={{ marginRight: 5 }} />
              <Text style={styles.backtestBtnText}>Instant Backtest (6M)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveStrategy}>
              <Feather name="check" size={16} color="#FFFFFF" style={{ marginRight: 5 }} />
              <Text style={styles.saveBtnText}>Save & Build</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Backtest Report Modal Overlay */}
      <BacktestReportModal
        visible={backtestModalVisible}
        onClose={() => setBacktestModalVisible(false)}
        result={backtestResult}
        strategy={getCompiledStrategy()}
        onDeploy={() => {
          setBacktestModalVisible(false);
          handleSaveStrategy();
        }}
      />
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
    height: '92%',
    paddingBottom: Spacing.lg,
    ...Shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30, 80, 220, 0.12)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(30, 80, 220, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  closeBtn: {
    padding: 6,
  },
  tabsBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(240, 246, 255, 0.85)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30, 80, 220, 0.1)',
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(30, 80, 220, 0.25)',
    ...Shadows.subtle,
  },
  tabBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabBtnTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  scrollBody: {
    padding: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 5,
  },
  textInput: {
    backgroundColor: 'rgba(245, 248, 255, 0.9)',
    borderWidth: 1.2,
    borderColor: 'rgba(30, 80, 220, 0.2)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    backgroundColor: 'rgba(240, 246, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(30, 80, 220, 0.18)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pillSmall: {
    backgroundColor: 'rgba(240, 246, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(30, 80, 220, 0.18)',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  twoCol: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionSub: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  addBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  riskCard: {
    backgroundColor: 'rgba(240, 246, 255, 0.85)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1.2,
    borderColor: 'rgba(30, 80, 220, 0.22)',
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  riskCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(30, 80, 220, 0.12)',
    marginVertical: Spacing.sm,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  switchLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  switchSub: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  footerRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    gap: Spacing.sm,
  },
  backtestBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(235, 243, 255, 0.95)',
    borderWidth: 1.2,
    borderColor: 'rgba(30, 80, 220, 0.3)',
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
  },
  backtestBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.textPrimary,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    ...Shadows.button,
  },
  saveBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
