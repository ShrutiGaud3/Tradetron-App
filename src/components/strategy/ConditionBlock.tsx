import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../../theme';
import { StrategyCondition } from '../../types';

interface ConditionBlockProps {
  condition: StrategyCondition;
  index: number;
  totalConditions: number;
  connector?: 'AND' | 'OR';
  onConnectorChange?: (connector: 'AND' | 'OR') => void;
  onUpdate: (updated: Partial<StrategyCondition>) => void;
  onRemove: () => void;
}

const COMMON_INDICATORS = [
  'RSI(14)',
  'Supertrend(7,3)',
  'EMA(20)',
  'EMA(50)',
  'VWAP',
  'MACD(12,26,9)',
  'Candle Close[-1]',
  'Candle High[-1]',
];

const OPERATORS: Array<{ label: string; value: StrategyCondition['operator'] }> = [
  { label: 'Crosses Above (↑)', value: 'crosses_above' },
  { label: 'Crosses Below (↓)', value: 'crosses_below' },
  { label: 'Greater Than (>)', value: '>' },
  { label: 'Less Than (<)', value: '<' },
  { label: 'Equal To (==)', value: '==' },
  { label: 'Greater or Equal (>=)', value: '>=' },
];

export const ConditionBlock: React.FC<ConditionBlockProps> = ({
  condition,
  index,
  totalConditions,
  connector = 'AND',
  onConnectorChange,
  onUpdate,
  onRemove,
}) => {
  return (
    <View style={styles.container}>
      {/* Connector between conditions */}
      {index > 0 && (
        <View style={styles.connectorRow}>
          <View style={styles.connectorLine} />
          <TouchableOpacity 
            style={styles.connectorBadge}
            onPress={() => onConnectorChange && onConnectorChange(connector === 'AND' ? 'OR' : 'AND')}
          >
            <Text style={styles.connectorText}>{connector}</Text>
            <Feather name="refresh-cw" size={10} color={Colors.primary} style={{ marginLeft: 3 }} />
          </TouchableOpacity>
          <View style={styles.connectorLine} />
        </View>
      )}

      {/* Main Condition Glass Box */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.badgeIndex}>
            <Text style={styles.badgeIndexText}>Condition #{index + 1}</Text>
          </View>
          {totalConditions > 1 && (
            <TouchableOpacity onPress={onRemove} style={styles.deleteBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="trash-2" size={14} color={Colors.accentCoral} />
            </TouchableOpacity>
          )}
        </View>

        {/* Left Indicator Operand */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Indicator / Price Action</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
            {COMMON_INDICATORS.map((ind) => {
              const isSelected = condition.leftOperand === ind;
              return (
                <TouchableOpacity
                  key={ind}
                  style={[styles.indicatorPill, isSelected && styles.indicatorPillActive]}
                  onPress={() => onUpdate({ leftOperand: ind })}
                >
                  <Text style={[styles.indicatorPillText, isSelected && styles.indicatorPillTextActive]}>
                    {ind}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Operator Selector */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Logic Operator</Text>
          <View style={styles.operatorsGrid}>
            {OPERATORS.map((op) => {
              const isSelected = condition.operator === op.value;
              return (
                <TouchableOpacity
                  key={op.value}
                  style={[styles.opBtn, isSelected && styles.opBtnActive]}
                  onPress={() => onUpdate({ operator: op.value })}
                >
                  <Text style={[styles.opBtnText, isSelected && styles.opBtnTextActive]}>
                    {op.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Right Threshold / Operand */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Compare With (Value / Level)</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.textInput}
              value={condition.rightOperand}
              onChangeText={(text) => onUpdate({ rightOperand: text })}
              placeholder="e.g. 60, 30, EMA(200), or Candle High[-1]"
              placeholderTextColor={Colors.textTertiary}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const ScrollView = require('react-native').ScrollView;

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  connectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.xs,
  },
  connectorLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(30, 80, 220, 0.15)',
  },
  connectorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(235, 243, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(30, 80, 220, 0.3)',
    borderRadius: BorderRadius.round,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginHorizontal: Spacing.sm,
  },
  connectorText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: 'rgba(240, 246, 255, 0.85)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1.2,
    borderColor: 'rgba(30, 80, 220, 0.22)',
    padding: Spacing.md,
    ...Shadows.subtle,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  badgeIndex: {
    backgroundColor: 'rgba(10, 37, 64, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  badgeIndexText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  deleteBtn: {
    padding: 4,
  },
  fieldGroup: {
    marginBottom: Spacing.sm,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 5,
  },
  pillScroll: {
    flexDirection: 'row',
  },
  indicatorPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(30, 80, 220, 0.18)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 6,
  },
  indicatorPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  indicatorPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  indicatorPillTextActive: {
    color: '#FFFFFF',
  },
  operatorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  opBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(30, 80, 220, 0.18)',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  opBtnActive: {
    backgroundColor: Colors.textPrimary,
    borderColor: Colors.textPrimary,
  },
  opBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  opBtnTextActive: {
    color: '#FFFFFF',
  },
  inputWrap: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(30, 80, 220, 0.2)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    height: 38,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
});
