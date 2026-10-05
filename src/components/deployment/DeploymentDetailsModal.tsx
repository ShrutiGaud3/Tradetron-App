import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  Alert 
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../../theme';
import { Deployment } from '../../types';
import { useAppStore } from '../../store/useAppStore';

interface DeploymentDetailsModalProps {
  visible: boolean;
  deployment: Deployment | null;
  onClose: () => void;
}

export const DeploymentDetailsModal: React.FC<DeploymentDetailsModalProps> = ({
  visible,
  deployment,
  onClose,
}) => {
  const pauseDeployment = useAppStore((state) => state.pauseDeployment);
  const resumeDeployment = useAppStore((state) => state.resumeDeployment);
  const emergencySquareOffDeployment = useAppStore((state) => state.emergencySquareOffDeployment);
  const positions = useAppStore((state) => state.positions);

  if (!deployment) return null;

  const depPositions = positions.filter((p) => p.deploymentId === deployment.id);
  const isProfit = deployment.todayPnL >= 0;
  const isLive = deployment.mode === 'LIVE';
  const isActive = deployment.status === 'ACTIVE';
  const isPaused = deployment.status === 'PAUSED';

  const handleTogglePause = () => {
    if (isActive) {
      pauseDeployment(deployment.id);
    } else {
      resumeDeployment(deployment.id);
    }
  };

  const handleEmergencySquareOff = () => {
    Alert.alert(
      '🚨 Emergency Square-Off',
      `Are you sure you want to stop "${deployment.strategyName}" and liquidate all ${depPositions.length} open position legs immediately at market price?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Square Off & Stop', 
          style: 'destructive',
          onPress: () => {
            emergencySquareOffDeployment(deployment.id);
            onClose();
          } 
        }
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
              <View style={[styles.modeBadge, isLive ? styles.modeBadgeLive : styles.modeBadgePaper]}>
                <MaterialCommunityIcons 
                  name={isLive ? "lightning-bolt" : "shield-outline"} 
                  size={14} 
                  color={isLive ? Colors.accentGreen : Colors.accentPurple} 
                />
                <Text style={[styles.modeBadgeText, { color: isLive ? Colors.accentGreen : Colors.accentPurple }]}>
                  {deployment.mode}
                </Text>
              </View>
              <View>
                <Text style={styles.title}>{deployment.strategyName}</Text>
                <Text style={styles.subtitle}>Broker: {deployment.brokerName} • {deployment.multiplier}x Multiplier</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Live Status & P&L Banner */}
            <View style={styles.pnlBanner}>
              <View>
                <Text style={styles.bannerLabel}>Today's Real-Time P&L</Text>
                <Text style={[styles.bannerPnL, { color: isProfit ? Colors.accentGreen : Colors.accentCoral }]}>
                  {isProfit ? '+' : ''}₹{deployment.todayPnL.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
                <Text style={styles.bannerSub}>Overall P&L: ₹{deployment.overallPnL.toLocaleString('en-IN')}</Text>
              </View>

              <View style={styles.statusBox}>
                <View style={[styles.statusPill, isActive ? styles.statusActive : isPaused ? styles.statusPaused : styles.statusStopped]}>
                  <View style={[styles.statusDot, isActive ? styles.dotActive : isPaused ? styles.dotPaused : styles.dotStopped]} />
                  <Text style={[styles.statusText, isActive ? styles.txtActive : isPaused ? styles.txtPaused : styles.txtStopped]}>
                    {deployment.status}
                  </Text>
                </View>
                <Text style={styles.timeTag}>Deployed {deployment.deployedAt}</Text>
              </View>
            </View>

            {/* Live Engine Signal Status */}
            <View style={styles.signalCard}>
              <View style={styles.signalHeader}>
                <MaterialCommunityIcons name="radar" size={16} color={Colors.primary} />
                <Text style={styles.signalTitle}>Execution Engine Telemetry</Text>
              </View>
              <Text style={styles.signalText}>{deployment.lastSignal || 'Listening for entry indicators on candle close...'}</Text>
            </View>

            {/* Active Position Legs */}
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>Open Position Legs ({depPositions.length})</Text>
              {depPositions.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>No open market positions. Engine is in standby waiting for signal condition triggers.</Text>
                </View>
              ) : (
                depPositions.map((pos) => {
                  const isPosWin = pos.pnl >= 0;
                  return (
                    <View key={pos.id} style={styles.posCard}>
                      <View style={styles.posTop}>
                        <View style={styles.posTagRow}>
                          <View style={[styles.sidePill, pos.side === 'BUY' ? styles.sideBuy : styles.sideSell]}>
                            <Text style={[styles.sideText, pos.side === 'BUY' ? styles.sideBuyText : styles.sideSellText]}>
                              {pos.side}
                            </Text>
                          </View>
                          <Text style={styles.posSymbol}>{pos.instrument}</Text>
                        </View>
                        <Text style={[styles.posPnL, { color: isPosWin ? Colors.accentGreen : Colors.accentCoral }]}>
                          {isPosWin ? '+' : ''}₹{pos.pnl.toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.posBottom}>
                        <Text style={styles.posMeta}>Qty: {pos.qty} • Avg: ₹{pos.avgPrice.toFixed(2)}</Text>
                        <Text style={styles.posMeta}>LTP: ₹{pos.ltp.toFixed(2)} ({isPosWin ? '+' : ''}{pos.pnlPercent}%)</Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>

            {/* Audit Log / Event Stream */}
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>Audit Trail & Execution Logs</Text>
              <View style={styles.logList}>
                {(deployment.auditLogs && deployment.auditLogs.length > 0) ? (
                  deployment.auditLogs.map((log) => (
                    <View key={log.id} style={styles.logRow}>
                      <View style={styles.logIconCol}>
                        <View style={styles.logDot} />
                        <View style={styles.logLine} />
                      </View>
                      <View style={styles.logContent}>
                        <View style={styles.logMetaRow}>
                          <Text style={styles.logType}>{log.type}</Text>
                          <Text style={styles.logTime}>{log.timestamp}</Text>
                        </View>
                        <Text style={styles.logMsg}>{log.message}</Text>
                        {log.details && <Text style={styles.logDetails}>{log.details}</Text>}
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.logRow}>
                    <View style={styles.logIconCol}>
                      <View style={styles.logDot} />
                    </View>
                    <View style={styles.logContent}>
                      <Text style={styles.logMsg}>Deployment initialized and active on live market tick feed.</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footerRow}>
            {deployment.status !== 'STOPPED' && (
              <TouchableOpacity 
                style={[styles.pauseBtn, isPaused && styles.resumeBtn]} 
                onPress={handleTogglePause}
              >
                <Feather name={isActive ? "pause" : "play"} size={16} color={isActive ? Colors.textPrimary : '#FFFFFF'} />
                <Text style={[styles.pauseBtnText, isPaused && { color: '#FFFFFF' }]}>
                  {isActive ? 'Pause Algo' : 'Resume Algo'}
                </Text>
              </TouchableOpacity>
            )}

            {deployment.status !== 'STOPPED' && (
              <TouchableOpacity 
                style={styles.squareOffBtn} 
                onPress={handleEmergencySquareOff}
              >
                <MaterialCommunityIcons name="lightning-bolt" size={16} color="#FFFFFF" />
                <Text style={styles.squareOffBtnText}>Emergency Exit</Text>
              </TouchableOpacity>
            )}
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
    maxHeight: '90%',
    paddingBottom: Spacing.xl,
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
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  modeBadgeLive: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  modeBadgePaper: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
  },
  modeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  closeBtn: {
    padding: 6,
  },
  scrollBody: {
    padding: Spacing.md,
  },
  pnlBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(235, 243, 255, 0.95)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1.2,
    borderColor: 'rgba(30, 80, 220, 0.22)',
    marginBottom: Spacing.md,
  },
  bannerLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  bannerPnL: {
    fontSize: 20,
    fontWeight: '800',
    marginVertical: 2,
  },
  bannerSub: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  statusBox: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.round,
    gap: 5,
  },
  statusActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusPaused: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  statusStopped: {
    backgroundColor: 'rgba(250, 90, 90, 0.15)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    backgroundColor: Colors.accentGreen,
  },
  dotPaused: {
    backgroundColor: Colors.accentAmber,
  },
  dotStopped: {
    backgroundColor: Colors.accentCoral,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  txtActive: {
    color: Colors.accentGreen,
  },
  txtPaused: {
    color: Colors.accentAmber,
  },
  txtStopped: {
    color: Colors.accentCoral,
  },
  timeTag: {
    fontSize: 9.5,
    color: Colors.textTertiary,
  },
  signalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(30, 80, 220, 0.18)',
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  signalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  signalTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  signalText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  emptyBox: {
    backgroundColor: 'rgba(240, 246, 255, 0.6)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 11,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  posCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(30, 80, 220, 0.15)',
    padding: Spacing.sm,
    marginBottom: 6,
  },
  posTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  posTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sidePill: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  sideBuy: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  sideSell: {
    backgroundColor: 'rgba(250, 90, 90, 0.15)',
  },
  sideText: {
    fontSize: 9,
    fontWeight: '800',
  },
  sideBuyText: {
    color: Colors.accentGreen,
  },
  sideSellText: {
    color: Colors.accentCoral,
  },
  posSymbol: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  posPnL: {
    fontSize: 12,
    fontWeight: '700',
  },
  posBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  posMeta: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  logList: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(30, 80, 220, 0.15)',
    padding: Spacing.sm,
  },
  logRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  logIconCol: {
    width: 16,
    alignItems: 'center',
    marginRight: 8,
  },
  logDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 4,
  },
  logLine: {
    flex: 1,
    width: 1,
    backgroundColor: 'rgba(30, 80, 220, 0.15)',
    marginVertical: 2,
  },
  logContent: {
    flex: 1,
  },
  logMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  logType: {
    fontSize: 9.5,
    fontWeight: '800',
    color: Colors.primary,
  },
  logTime: {
    fontSize: 9,
    color: Colors.textTertiary,
  },
  logMsg: {
    fontSize: 10.5,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  logDetails: {
    fontSize: 9.5,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  footerRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  pauseBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 37, 64, 0.08)',
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    gap: 5,
  },
  resumeBtn: {
    backgroundColor: Colors.accentGreen,
  },
  pauseBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  squareOffBtn: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accentCoral,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    gap: 5,
    ...Shadows.button,
  },
  squareOffBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
