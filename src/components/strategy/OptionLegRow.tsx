import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../../theme';
import { StrategyLeg } from '../../types';

interface OptionLegRowProps {
  leg: StrategyLeg;
  index: number;
  totalLegs: number;
  onUpdate: (updated: Partial<StrategyLeg>) => void;
  onRemove: () => void;
}

const STRIKE_OFFSETS: Array<StrategyLeg['strikeOffset']> = [
  'ITM2',
  'ITM1',
  'ATM',
  'OTM1',
  'OTM2',
];

export const OptionLegRow: React.FC<OptionLegRowProps> = ({
  leg,
  index,
  totalLegs,
  onUpdate,
  onRemove,
}) => {
  return (
    <View style={styles.card}>
      {/* Header: Leg Title & Action (BUY / SELL) */}
      <View style={styles.headerRow}>
        <View style={styles.legTag}>
          <Text style={styles.legTagText}>Leg #{index + 1}</Text>
        </View>

        {/* Action Toggle (BUY vs SELL) */}
        <View style={styles.actionToggle}>
          <TouchableOpacity
            style={[styles.actionBtn, leg.action === 'BUY' && styles.actionBuyActive]}
            onPress={() => onUpdate({ action: 'BUY' })}
          >
            <Text style={[styles.actionBtnText, leg.action === 'BUY' && styles.actionBtnTextActive]}>
              BUY
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, leg.action === 'SELL' && styles.actionSellActive]}
            onPress={() => onUpdate({ action: 'SELL' })}
          >
            <Text style={[styles.actionBtnText, leg.action === 'SELL' && styles.actionBtnTextActive]}>
              SELL
            </Text>
          </TouchableOpacity>
        </View>

        {/* Delete Leg Button */}
        {totalLegs > 1 && (
          <TouchableOpacity onPress={onRemove} style={styles.deleteBtn}>
            <Feather name="trash-2" size={14} color={Colors.accentCoral} />
          </TouchableOpacity>
        )}
      </View>

      {/* Row 1: Option Type (CE / PE / FUT) & Expiry */}
      <View style={styles.twoColumnRow}>
        {/* Type Selector */}
        <View style={styles.col}>
          <Text style={styles.label}>Instrument / Type</Text>
          <View style={styles.chipGroup}>
            {(['CE', 'PE', 'FUT'] as const).map((t) => {
              const isSelected = leg.optionType === t || (t === 'FUT' && leg.segment === 'FUT');
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => {
                    if (t === 'FUT') {
                      onUpdate({ segment: 'FUT', optionType: undefined });
                    } else {
                      onUpdate({ segment: 'OPT', optionType: t });
                    }
                  }}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Expiry Selector */}
        <View style={styles.col}>
          <Text style={styles.label}>Expiry</Text>
          <View style={styles.chipGroup}>
            {(['CURRENT_WEEK', 'NEXT_WEEK', 'MONTHLY'] as const).map((e) => {
              const isSelected = leg.expiry === e;
              const label = e === 'CURRENT_WEEK' ? 'Weekly' : e === 'NEXT_WEEK' ? 'Next Wk' : 'Monthly';
              return (
                <TouchableOpacity
                  key={e}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => onUpdate({ expiry: e })}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* Row 2: Strike Selection (ATM, ITM, OTM) & Lots */}
      {leg.segment !== 'FUT' && (
        <View style={styles.strikeSection}>
          <Text style={styles.label}>Strike Selection</Text>
          <View style={styles.strikeRow}>
            {STRIKE_OFFSETS.map((s) => {
              const isSelected = leg.strikeOffset === s;
              return (
                <TouchableOpacity
                  key={s}
                  style={[styles.strikePill, isSelected && styles.strikePillActive]}
                  onPress={() => onUpdate({ strikeOffset: s })}
                >
                  <Text style={[styles.strikePillText, isSelected && styles.strikePillTextActive]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Row 3: Lots, Target % & Stop Loss % */}
      <View style={styles.metaRow}>
        {/* Lots Counter */}
        <View style={styles.metaCol}>
          <Text style={styles.label}>Lots (Size)</Text>
          <View style={styles.stepperWrap}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => onUpdate({ lots: Math.max(1, leg.lots - 1) })}
            >
              <Feather name="minus" size={12} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.stepperVal}>{leg.lots}</Text>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => onUpdate({ lots: leg.lots + 1 })}
            >
              <Feather name="plus" size={12} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Target % */}
        <View style={styles.metaCol}>
          <Text style={styles.label}>Target (%)</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.numInput}
              keyboardType="numeric"
              value={leg.targetPercent ? String(leg.targetPercent) : ''}
              onChangeText={(t) => onUpdate({ targetPercent: parseFloat(t) || undefined })}
              placeholder="e.g. 35"
              placeholderTextColor={Colors.textTertiary}
            />
          </View>
        </View>

        {/* Stop Loss % */}
        <View style={styles.metaCol}>
          <Text style={styles.label}>Stop Loss (%)</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.numInput}
              keyboardType="numeric"
              value={leg.stopLossPercent ? String(leg.stopLossPercent) : ''}
              onChangeText={(t) => onUpdate({ stopLossPercent: parseFloat(t) || undefined })}
              placeholder="e.g. 20"
              placeholderTextColor={Colors.textTertiary}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(240, 246, 255, 0.85)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1.2,
    borderColor: 'rgba(30, 80, 220, 0.22)',
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.subtle,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  legTag: {
    backgroundColor: 'rgba(10, 37, 64, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  legTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  actionToggle: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: 2,
    borderWidth: 1,
    borderColor: 'rgba(30, 80, 220, 0.18)',
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  actionBuyActive: {
    backgroundColor: Colors.accentGreen,
  },
  actionSellActive: {
    backgroundColor: Colors.accentCoral,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  actionBtnTextActive: {
    color: '#FFFFFF',
  },
  deleteBtn: {
    padding: 4,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  col: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  chipGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  chip: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(30, 80, 220, 0.18)',
    borderRadius: BorderRadius.sm,
    paddingVertical: 5,
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: Colors.textPrimary,
    borderColor: Colors.textPrimary,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  strikeSection: {
    marginBottom: Spacing.sm,
  },
  strikeRow: {
    flexDirection: 'row',
    gap: 4,
  },
  strikePill: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(30, 80, 220, 0.18)',
    borderRadius: BorderRadius.sm,
    paddingVertical: 5,
    alignItems: 'center',
  },
  strikePillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  strikePillText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  strikePillTextActive: {
    color: '#FFFFFF',
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  metaCol: {
    flex: 1,
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(30, 80, 220, 0.2)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: 4,
    height: 34,
  },
  stepBtn: {
    padding: 6,
  },
  stepperVal: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  inputWrap: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(30, 80, 220, 0.2)',
    borderRadius: BorderRadius.md,
    height: 34,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  numInput: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});
