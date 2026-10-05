import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '../common/Card';
import { Colors, Spacing, BorderRadius, Shadows } from '../../theme';
import { BrokerAccount } from '../../types';

interface BrokerCardProps {
  broker: BrokerAccount;
  onManage: (broker: BrokerAccount) => void;
  onReAuth: (broker: BrokerAccount) => void;
  onSync: (broker: BrokerAccount) => void;
}

export const BrokerCard: React.FC<BrokerCardProps> = ({
  broker,
  onManage,
  onReAuth,
  onSync,
}) => {
  const isConnected = broker.status === 'CONNECTED';
  const isExpired = broker.status === 'TOKEN_EXPIRED';
  const isDisconnected = broker.status === 'DISCONNECTED';

  const totalFunds = broker.availableFunds + broker.usedMargin;
  const usedPercent = totalFunds > 0 ? (broker.usedMargin / totalFunds) * 100 : 0;

  return (
    <Card style={styles.card} variant="blueGlass" highlighted={broker.isPrimary}>
      {/* Top Header Row */}
      <View style={styles.topRow}>
        <View style={styles.brokerLeft}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons 
              name={broker.brokerCode === 'ZERODHA' ? 'kite' : 'bank'} 
              size={18} 
              color={Colors.primary} 
            />
          </View>
          <View>
            <View style={styles.nameRow}>
              <Text style={styles.brokerName}>{broker.brokerName}</Text>
              {broker.isPrimary && (
                <View style={styles.primaryBadge}>
                  <Text style={styles.primaryBadgeText}>PRIMARY</Text>
                </View>
              )}
            </View>
            <Text style={styles.accountRefText}>{broker.accountRef}</Text>
          </View>
        </View>

        {/* Status Pill with Ping */}
        <View style={[
          styles.statusBadge,
          isConnected ? styles.badgeConnected : isExpired ? styles.badgeExpired : styles.badgeDisconnected
        ]}>
          <Text style={[
            styles.statusBadgeText,
            isConnected ? styles.textConnected : isExpired ? styles.textExpired : styles.textDisconnected
          ]}>
            {isConnected ? `● LIVE (${broker.pingLatencyMs}ms)` : isExpired ? '● EXPIRED' : 'DISCONNECTED'}
          </Text>
        </View>
      </View>

      {/* Funds & Margin Visual Split */}
      {isConnected && (
        <View style={styles.marginSection}>
          <View style={styles.fundsGrid}>
            <View style={styles.fundCol}>
              <Text style={styles.fundLabel}>Available Cash</Text>
              <Text style={[styles.fundValue, { color: Colors.primary }]}>
                ₹{broker.availableFunds.toLocaleString()}
              </Text>
            </View>

            <View style={styles.fundCol}>
              <Text style={styles.fundLabel}>Used Margin</Text>
              <Text style={[styles.fundValue, { color: Colors.textSecondary }]}>
                ₹{broker.usedMargin.toLocaleString()}
              </Text>
            </View>

            <View style={styles.fundCol}>
              <Text style={styles.fundLabel}>Collateral</Text>
              <Text style={[styles.fundValue, { color: Colors.accentGreen }]}>
                ₹{broker.totalCollateral.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Margin Utilization Progress Bar */}
          <View style={styles.progressTrack}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${Math.min(100, Math.max(5, usedPercent))}%` },
                usedPercent > 80 ? styles.progressDanger : styles.progressNormal
              ]} 
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressText}>Margin Utilized: {usedPercent.toFixed(1)}%</Text>
            <Text style={styles.progressText}>Expires: {broker.tokenExpiresAt}</Text>
          </View>
        </View>
      )}

      {/* Footer Info & Quick Actions */}
      <View style={styles.footerRow}>
        <TouchableOpacity 
          style={styles.syncBtn}
          onPress={() => onSync(broker)}
          activeOpacity={0.7}
        >
          <Feather name="refresh-cw" size={11} color={Colors.textSecondary} />
          <Text style={styles.lastSyncText}>Synced {broker.lastSyncAt}</Text>
        </TouchableOpacity>

        <View style={styles.btnGroup}>
          <TouchableOpacity 
            style={styles.detailsBtn}
            onPress={() => onManage(broker)}
            activeOpacity={0.7}
          >
            <Feather name="sliders" size={11} color={Colors.textSecondary} />
            <Text style={styles.detailsBtnText}>Manage</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.actionBtn,
              isConnected ? styles.actionBtnOutlined : styles.actionBtnPrimary
            ]}
            onPress={() => onReAuth(broker)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons 
              name={isConnected ? "key-wireless" : "login"} 
              size={13} 
              color={isConnected ? Colors.primary : "#FFFFFF"} 
            />
            <Text style={[
              styles.actionBtnText,
              isConnected ? styles.textPrimary : styles.textWhite
            ]}>
              {isConnected ? 'Re-Auth' : 'Connect'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  brokerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.25)',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  brokerName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  primaryBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  primaryBadgeText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  accountRefText: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: BorderRadius.round,
  },
  badgeConnected: {
    backgroundColor: Colors.accentGreenLight,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  badgeExpired: {
    backgroundColor: Colors.accentCoralLight,
    borderWidth: 1,
    borderColor: 'rgba(250, 90, 90, 0.3)',
  },
  badgeDisconnected: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.15)',
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  textConnected: {
    color: Colors.accentGreen,
  },
  textExpired: {
    color: Colors.accentCoral,
  },
  textDisconnected: {
    color: Colors.textTertiary,
  },
  marginSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: BorderRadius.md,
    padding: 8,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.15)',
  },
  fundsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  fundCol: {
    flex: 1,
  },
  fundLabel: {
    fontSize: 8.5,
    color: Colors.textTertiary,
    fontWeight: '600',
    marginBottom: 1,
  },
  fundValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  progressNormal: {
    backgroundColor: Colors.primary,
  },
  progressDanger: {
    backgroundColor: Colors.accentCoral,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 8.5,
    color: Colors.textTertiary,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lastSyncText: {
    fontSize: 9.5,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  btnGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.25)',
  },
  detailsBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: BorderRadius.round,
  },
  actionBtnPrimary: {
    backgroundColor: Colors.primary,
    ...Shadows.button,
  },
  actionBtnOutlined: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  actionBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  textPrimary: {
    color: Colors.primary,
  },
  textWhite: {
    color: '#FFFFFF',
  },
});
