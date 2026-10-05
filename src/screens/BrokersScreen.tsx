import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../components/common/Header';
import { Card } from '../components/common/Card';
import { BrokerCard } from '../components/broker/BrokerCard';
import { BrokerConnectModal } from '../components/broker/BrokerConnectModal';
import { BrokerDetailsModal } from '../components/broker/BrokerDetailsModal';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { BrokerAccount } from '../types';

export const BrokersScreen: React.FC = () => {
  const brokers = useAppStore((state) => state.brokers);
  const syncBrokerMargins = useAppStore((state) => state.syncBrokerMargins);
  const refreshBrokerToken = useAppStore((state) => state.refreshBrokerToken);

  const [connectModalVisible, setConnectModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<BrokerAccount | null>(null);

  const connectedCount = brokers.filter(b => b.status === 'CONNECTED').length;
  const expiredCount = brokers.filter(b => b.status === 'TOKEN_EXPIRED').length;

  const handleOpenConnect = (broker: BrokerAccount) => {
    setSelectedBroker(broker);
    setDetailsModalVisible(false);
    setConnectModalVisible(true);
  };

  const handleOpenManage = (broker: BrokerAccount) => {
    setSelectedBroker(broker);
    setDetailsModalVisible(true);
  };

  const handleQuickReAuth = (broker: BrokerAccount) => {
    if (broker.status === 'DISCONNECTED') {
      handleOpenConnect(broker);
    } else {
      refreshBrokerToken(broker.id);
      Alert.alert(
        'Token Renewed! ⚡',
        `JWT token renewed for ${broker.brokerName}. Orders will execute automatically until 23:59 IST.`
      );
    }
  };

  const handleSyncMargin = (broker: BrokerAccount) => {
    syncBrokerMargins(broker.id);
    Alert.alert(
      'Margins Synced',
      `${broker.brokerName} available cash & collateral margins updated.`
    );
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#DCEBFA', '#EAF2F9', '#F4F8FC']}
        style={StyleSheet.absoluteFill}
      />

      <Header title="Tradetron" subtitle="Broker Connections" />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Global Connection Health Status Banner */}
        <Card style={styles.statusBanner} variant="blueGlass">
          <View style={styles.statusRow}>
            <View style={styles.statusIconCircle}>
              <MaterialCommunityIcons 
                name="server-network" 
                size={18} 
                color={Colors.primary} 
              />
            </View>

            <View style={styles.statusTextCol}>
              <View style={styles.statusHeaderRow}>
                <Text style={styles.statusTitle}>Broker Engine Status</Text>
                <View style={styles.livePulse}>
                  <View style={styles.pulseDot} />
                  <Text style={styles.pulseText}>LIVE</Text>
                </View>
              </View>
              <Text style={styles.statusSubtitle}>
                {connectedCount} Active Brokers • {expiredCount > 0 ? `${expiredCount} Needs Re-Auth` : 'All Feeds Synced'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Section Header: Connected Brokers */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Authorized Broker Accounts</Text>
          <TouchableOpacity 
            style={styles.addBrokerBtn}
            onPress={() => handleOpenConnect(brokers[0])}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={13} color="#FFFFFF" />
            <Text style={styles.addBrokerText}>Add Account</Text>
          </TouchableOpacity>
        </View>

        {/* Broker Cards List */}
        {brokers.map((broker) => (
          <BrokerCard
            key={broker.id}
            broker={broker}
            onManage={handleOpenManage}
            onReAuth={handleQuickReAuth}
            onSync={handleSyncMargin}
          />
        ))}

        {/* Security / SEBI Mandate Notice Card */}
        <Card style={styles.infoCard} variant="blueGlass">
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="shield-lock" size={18} color={Colors.primary} />
            <View style={styles.infoTextCol}>
              <Text style={styles.infoTitle}>SEBI & Exchange Compliant Adapter</Text>
              <Text style={styles.infoDesc}>
                Per Indian regulatory mandates, automated broker sessions require daily token authorization before 09:15 AM IST.
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Connect / OAuth Modal */}
      <BrokerConnectModal
        visible={connectModalVisible}
        broker={selectedBroker}
        onClose={() => setConnectModalVisible(false)}
      />

      {/* Broker Diagnostics & Details Modal */}
      <BrokerDetailsModal
        visible={detailsModalVisible}
        broker={selectedBroker}
        onClose={() => setDetailsModalVisible(false)}
        onOpenConnect={handleOpenConnect}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxxl * 2,
  },
  statusBanner: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.25)',
  },
  statusTextCol: {
    flex: 1,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  livePulse: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accentGreenLight,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: BorderRadius.round,
  },
  pulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.accentGreen,
  },
  pulseText: {
    fontSize: 8,
    fontWeight: '900',
    color: Colors.accentGreen,
  },
  statusSubtitle: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  addBrokerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.primary,
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: BorderRadius.round,
    ...Shadows.subtle,
  },
  addBrokerText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  infoCard: {
    marginTop: 4,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  infoTextCol: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: Colors.primary,
  },
  infoDesc: {
    fontSize: 9.5,
    color: Colors.textSecondary,
    lineHeight: 13.5,
    marginTop: 2,
  },
});
