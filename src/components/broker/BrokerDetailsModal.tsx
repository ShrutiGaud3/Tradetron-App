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
import { BrokerAccount } from '../../types';
import { useAppStore } from '../../store/useAppStore';

interface BrokerDetailsModalProps {
  visible: boolean;
  broker: BrokerAccount | null;
  onClose: () => void;
  onOpenConnect: (broker: BrokerAccount) => void;
}

export const BrokerDetailsModal: React.FC<BrokerDetailsModalProps> = ({
  visible,
  broker,
  onClose,
  onOpenConnect,
}) => {
  const refreshBrokerToken = useAppStore((state) => state.refreshBrokerToken);
  const setPrimaryBroker = useAppStore((state) => state.setPrimaryBroker);
  const disconnectBroker = useAppStore((state) => state.disconnectBroker);
  const syncBrokerMargins = useAppStore((state) => state.syncBrokerMargins);

  if (!broker) return null;

  const isConnected = broker.status === 'CONNECTED';

  const handleSetPrimary = () => {
    setPrimaryBroker(broker.id);
    Alert.alert('Primary Broker Updated', `${broker.brokerName} is now set as your primary execution broker.`);
  };

  const handleForceRefresh = () => {
    refreshBrokerToken(broker.id);
    Alert.alert('Token Refreshed', `JWT access token renewed for ${broker.brokerName}. Valid until 23:59 IST.`);
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Broker Account',
      `Are you sure you want to disconnect ${broker.brokerName}? Any live running strategies connected to this broker will be paused.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Disconnect', 
          style: 'destructive',
          onPress: () => {
            disconnectBroker(broker.id);
            onClose();
          } 
        },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.brokerIcon}>
                <MaterialCommunityIcons name="bank" size={20} color={Colors.primary} />
              </View>
              <View>
                <View style={styles.nameRow}>
                  <Text style={styles.title}>{broker.brokerName}</Text>
                  {broker.isPrimary && (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryText}>PRIMARY</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.subtitle}>{broker.accountRef} • Auth: {broker.authType}</Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
            {/* Connection Diagnostics Grid */}
            <View style={styles.diagGrid}>
              <View style={styles.diagBox}>
                <Text style={styles.diagLabel}>Ping Latency</Text>
                <Text style={[styles.diagVal, { color: isConnected ? Colors.accentGreen : Colors.accentCoral }]}>
                  {isConnected ? `${broker.pingLatencyMs}ms (Optimal)` : 'N/A'}
                </Text>
              </View>

              <View style={styles.diagDivider} />

              <View style={styles.diagBox}>
                <Text style={styles.diagLabel}>Session Validity</Text>
                <Text style={styles.diagVal}>{broker.tokenExpiresAt}</Text>
              </View>
            </View>

            {/* Funds & Collateral Margin Breakdown */}
            <Text style={styles.sectionHeading}>Margin & Trading Capital</Text>
            <View style={styles.marginCard}>
              <View style={styles.marginRow}>
                <Text style={styles.marginKey}>Available Cash Balance</Text>
                <Text style={[styles.marginValue, { color: Colors.primary }]}>
                  ₹{broker.availableFunds.toLocaleString()}
                </Text>
              </View>
              <View style={styles.rowDivider} />

              <View style={styles.marginRow}>
                <Text style={styles.marginKey}>Utilized Margin</Text>
                <Text style={styles.marginValue}>₹{broker.usedMargin.toLocaleString()}</Text>
              </View>
              <View style={styles.rowDivider} />

              <View style={styles.marginRow}>
                <Text style={styles.marginKey}>Securities / Collateral</Text>
                <Text style={[styles.marginValue, { color: Colors.accentGreen }]}>
                  ₹{broker.totalCollateral.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Supported Trading Segments */}
            <Text style={styles.sectionHeading}>Supported Exchange Segments</Text>
            <View style={styles.segmentsRow}>
              {broker.supportedSegments.map((seg, idx) => (
                <View key={idx} style={styles.segBadge}>
                  <MaterialCommunityIcons name="check-circle" size={12} color={Colors.accentGreen} />
                  <Text style={styles.segText}>{seg}</Text>
                </View>
              ))}
            </View>

            {/* Connection Audit Logs Timeline */}
            <Text style={styles.sectionHeading}>Recent Heartbeat & Token Logs</Text>
            <View style={styles.logsContainer}>
              {broker.connectionLogs.length === 0 ? (
                <Text style={styles.noLogsText}>No audit logs available</Text>
              ) : (
                broker.connectionLogs.map((log) => (
                  <View key={log.id} style={styles.logItem}>
                    <View style={[
                      styles.logDot,
                      log.type === 'AUTH_SUCCESS' ? styles.dotGreen : log.type === 'ERROR' ? styles.dotRed : styles.dotBlue
                    ]} />
                    <View style={styles.logContent}>
                      <Text style={styles.logMsg}>{log.message}</Text>
                      <Text style={styles.logTime}>{log.timestamp}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>

          {/* Footer Action Controls */}
          <View style={styles.footerButtons}>
            {!broker.isPrimary && isConnected && (
              <TouchableOpacity 
                style={styles.primarySwitchBtn}
                onPress={handleSetPrimary}
              >
                <MaterialCommunityIcons name="star-outline" size={14} color={Colors.primary} />
                <Text style={styles.primarySwitchText}>Set as Primary Broker</Text>
              </TouchableOpacity>
            )}

            <View style={styles.dualBtnRow}>
              <TouchableOpacity 
                style={styles.refreshBtn}
                onPress={handleForceRefresh}
              >
                <Feather name="refresh-cw" size={13} color="#FFFFFF" />
                <Text style={styles.refreshBtnText}>Renew Token</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.disconnectBtn}
                onPress={handleDisconnect}
              >
                <Feather name="trash-2" size={13} color={Colors.accentCoral} />
                <Text style={styles.disconnectBtnText}>Disconnect</Text>
              </TouchableOpacity>
            </View>
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
    padding: Spacing.lg,
    maxHeight: '90%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brokerIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  primaryBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  primaryText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    marginBottom: Spacing.md,
  },
  diagGrid: {
    flexDirection: 'row',
    backgroundColor: 'rgba(219, 234, 254, 0.50)',
    borderRadius: BorderRadius.md,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.20)',
    marginBottom: 10,
  },
  diagBox: {
    flex: 1,
    alignItems: 'center',
  },
  diagDivider: {
    width: 1,
    height: '80%',
    backgroundColor: 'rgba(37, 99, 235, 0.20)',
    alignSelf: 'center',
  },
  diagLabel: {
    fontSize: 9,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  diagVal: {
    fontSize: 11.5,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 6,
    marginBottom: 6,
  },
  marginCard: {
    backgroundColor: 'rgba(240, 246, 255, 0.75)',
    borderRadius: BorderRadius.md,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.15)',
    marginBottom: 8,
  },
  marginRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  marginKey: {
    fontSize: 10.5,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  marginValue: {
    fontSize: 11.5,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(37, 99, 235, 0.10)',
    marginVertical: 2,
  },
  segmentsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  segBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.90)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.18)',
  },
  segText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  logsContainer: {
    backgroundColor: 'rgba(240, 246, 255, 0.70)',
    borderRadius: BorderRadius.md,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.15)',
  },
  noLogsText: {
    fontSize: 10,
    color: Colors.textTertiary,
    textAlign: 'center',
    paddingVertical: 6,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 6,
  },
  logDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
  dotGreen: {
    backgroundColor: Colors.accentGreen,
  },
  dotBlue: {
    backgroundColor: Colors.primary,
  },
  dotRed: {
    backgroundColor: Colors.accentCoral,
  },
  logContent: {
    flex: 1,
  },
  logMsg: {
    fontSize: 10,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  logTime: {
    fontSize: 8.5,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  footerButtons: {
    gap: 6,
    paddingTop: 4,
  },
  primarySwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: 'rgba(37, 99, 235, 0.10)',
    paddingVertical: 8,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.25)',
  },
  primarySwitchText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  dualBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  refreshBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: BorderRadius.round,
    ...Shadows.button,
  },
  refreshBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  disconnectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: Colors.accentCoralLight,
    paddingVertical: 10,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: 'rgba(250, 90, 90, 0.3)',
  },
  disconnectBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: Colors.accentCoral,
  },
});
