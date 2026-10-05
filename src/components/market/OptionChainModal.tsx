import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  Alert 
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../../theme';
import { mockOptionChainNifty } from '../../data/marketData';
import { useAppStore } from '../../store/useAppStore';

export const OptionChainModal: React.FC = () => {
  const isOptionChainOpen = useAppStore((state) => state.isOptionChainOpen);
  const selectedOptionUnderlying = useAppStore((state) => state.selectedOptionUnderlying);
  const setOptionChainOpen = useAppStore((state) => state.setOptionChainOpen);

  const [underlying, setUnderlying] = useState<'NIFTY' | 'BANKNIFTY'>(selectedOptionUnderlying || 'NIFTY');
  const [expiry, setExpiry] = useState<'CURRENT_WEEK' | 'NEXT_WEEK' | 'MONTHLY'>('CURRENT_WEEK');

  const handleSelectStrike = (strike: number, type: 'CE' | 'PE', price: number) => {
    Alert.alert(
      'Option Selected',
      `${underlying} ${strike} ${type} @ ₹${price.toFixed(2)}\n\nWould you like to build a strategy condition or deploy a quick paper leg?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Add to Algo Leg', onPress: () => setOptionChainOpen(false) },
      ]
    );
  };

  if (!isOptionChainOpen) return null;

  return (
    <Modal visible={isOptionChainOpen} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.chainIcon}>
                <MaterialCommunityIcons name="table-split-cell" size={18} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.title}>Live Options Chain Matrix</Text>
                <Text style={styles.subtitle}>Real-time Delta, IV & Open Interest Feed</Text>
              </View>
            </View>

            <TouchableOpacity onPress={() => setOptionChainOpen(false)} style={styles.closeBtn}>
              <Feather name="x" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Controls: Underlying & Expiry Selector */}
          <View style={styles.controlsRow}>
            <View style={styles.pillGroup}>
              {(['NIFTY', 'BANKNIFTY'] as const).map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[styles.smallPill, underlying === u && styles.smallPillActive]}
                  onPress={() => setUnderlying(u)}
                >
                  <Text style={[styles.pillText, underlying === u && styles.pillTextActive]}>
                    {u}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.pillGroup}>
              {(['CURRENT_WEEK', 'NEXT_WEEK'] as const).map((e) => (
                <TouchableOpacity
                  key={e}
                  style={[styles.smallPill, expiry === e && styles.smallPillActive]}
                  onPress={() => setExpiry(e)}
                >
                  <Text style={[styles.pillText, expiry === e && styles.pillTextActive]}>
                    {e === 'CURRENT_WEEK' ? '07 Oct (Wk)' : '14 Oct'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Option Chain Table Header */}
          <View style={styles.tableHeader}>
            <View style={styles.sideHeaderCall}>
              <Text style={styles.tableHeadTxt}>CALL (CE)</Text>
              <Text style={styles.tableSubTxt}>LTP / OI</Text>
            </View>

            <View style={styles.sideHeaderStrike}>
              <Text style={styles.strikeHeadTxt}>STRIKE</Text>
            </View>

            <View style={styles.sideHeaderPut}>
              <Text style={styles.tableHeadTxt}>PUT (PE)</Text>
              <Text style={styles.tableSubTxt}>LTP / OI</Text>
            </View>
          </View>

          {/* Matrix Rows */}
          <ScrollView showsVerticalScrollIndicator={false} style={styles.tableBody}>
            {mockOptionChainNifty.map((row) => {
              const isAtm = !!row.isAtm;

              return (
                <View 
                  key={row.strikePrice} 
                  style={[styles.strikeRow, isAtm && styles.atmStrikeRow]}
                >
                  {/* Call Side */}
                  <TouchableOpacity 
                    style={[styles.callCell, isAtm && styles.atmCell]}
                    onPress={() => handleSelectStrike(row.strikePrice, 'CE', row.call.ltp)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.cellContent}>
                      <Text style={[styles.priceTxt, { color: Colors.accentGreen }]}>
                        ₹{row.call.ltp.toFixed(2)}
                      </Text>
                      <Text style={styles.oiTxt}>{(row.call.oi / 100000).toFixed(1)}L OI</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Center Strike Price */}
                  <View style={[styles.strikeCell, isAtm && styles.atmCenterCell]}>
                    {isAtm && (
                      <View style={styles.atmTag}>
                        <Text style={styles.atmTagTxt}>ATM</Text>
                      </View>
                    )}
                    <Text style={[styles.strikeNumber, isAtm && styles.atmStrikeNumber]}>
                      {row.strikePrice}
                    </Text>
                  </View>

                  {/* Put Side */}
                  <TouchableOpacity 
                    style={[styles.putCell, isAtm && styles.atmCell]}
                    onPress={() => handleSelectStrike(row.strikePrice, 'PE', row.put.ltp)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.cellContent}>
                      <Text style={[styles.priceTxt, { color: Colors.accentCoral }]}>
                        ₹{row.put.ltp.toFixed(2)}
                      </Text>
                      <Text style={styles.oiTxt}>{(row.put.oi / 100000).toFixed(1)}L OI</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>

          {/* Quick Tip Footer */}
          <View style={styles.footerNote}>
            <MaterialCommunityIcons name="gesture-tap" size={13} color={Colors.primary} />
            <Text style={styles.footerTxt}>
              Tap any Call or Put strike to configure dynamic ATM/OTM multi-leg algo rules.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.60)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.md,
    maxHeight: '85%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chainIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  closeBtn: {
    padding: 4,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  pillGroup: {
    flexDirection: 'row',
    backgroundColor: 'rgba(240, 246, 255, 0.90)',
    borderRadius: BorderRadius.round,
    padding: 2.5,
    borderWidth: 1,
    borderColor: Colors.borderGlass,
  },
  smallPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: BorderRadius.round,
  },
  smallPillActive: {
    backgroundColor: '#FFFFFF',
    ...Shadows.subtle,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  pillTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    borderRadius: BorderRadius.sm,
    paddingVertical: 5,
    marginTop: 4,
  },
  sideHeaderCall: {
    flex: 1,
    alignItems: 'center',
  },
  sideHeaderStrike: {
    width: 80,
    alignItems: 'center',
  },
  sideHeaderPut: {
    flex: 1,
    alignItems: 'center',
  },
  tableHeadTxt: {
    fontSize: 9.5,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  tableSubTxt: {
    fontSize: 8,
    color: Colors.textTertiary,
    fontWeight: '600',
  },
  strikeHeadTxt: {
    fontSize: 9.5,
    fontWeight: '800',
    color: Colors.primary,
  },
  tableBody: {
    marginVertical: 4,
  },
  strikeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(37, 99, 235, 0.08)',
  },
  atmStrikeRow: {
    backgroundColor: 'rgba(37, 99, 235, 0.10)',
    borderRadius: BorderRadius.sm,
  },
  callCell: {
    flex: 1,
    paddingHorizontal: 8,
  },
  putCell: {
    flex: 1,
    paddingHorizontal: 8,
    alignItems: 'flex-end',
  },
  atmCell: {
    borderRadius: BorderRadius.xs,
  },
  strikeCell: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  atmCenterCell: {
    backgroundColor: Colors.primaryLight,
    paddingVertical: 2,
    borderRadius: 4,
  },
  atmTag: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    marginBottom: 1,
  },
  atmTagTxt: {
    fontSize: 7,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cellContent: {
    gap: 1,
  },
  priceTxt: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  oiTxt: {
    fontSize: 8.5,
    color: Colors.textTertiary,
    fontWeight: '600',
  },
  strikeNumber: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  atmStrikeNumber: {
    color: Colors.primary,
    fontWeight: '900',
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(219, 234, 254, 0.50)',
    padding: 8,
    borderRadius: BorderRadius.md,
    marginTop: 6,
  },
  footerTxt: {
    flex: 1,
    fontSize: 9.5,
    color: Colors.textSecondary,
    lineHeight: 13,
  },
});
