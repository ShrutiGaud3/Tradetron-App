import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../components/common/Header';
import { Card } from '../components/common/Card';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme';
import { useAppStore } from '../store/useAppStore';

export const OrdersScreen: React.FC = () => {
  const orders = useAppStore((state) => state.orders);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'EXECUTED' | 'PENDING' | 'REJECTED'>('ALL');

  const filteredOrders = orders.filter((o) => {
    if (activeFilter === 'ALL') return true;
    return o.status === activeFilter;
  });

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#EAF2F9', '#F0F5FA', '#F6F9FD']}
        style={StyleSheet.absoluteFill}
      />

      <Header title="Tradetron" subtitle="Order Book" />

      <View style={styles.content}>
        {/* Status Filter Chips */}
        <View style={styles.filterRow}>
          {(['ALL', 'EXECUTED', 'PENDING', 'REJECTED'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Orders List */}
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredOrders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="file-document-outline" size={42} color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>No Orders Found</Text>
              <Text style={styles.emptySubtitle}>There are no {activeFilter.toLowerCase()} orders for today's trading session.</Text>
            </View>
          ) : (
            filteredOrders.map((ord) => {
              const isBuy = ord.side === 'BUY';
              const isExecuted = ord.status === 'EXECUTED';
              const isPending = ord.status === 'PENDING';

              return (
                <Card key={ord.id} style={styles.orderCard} variant="glass">
                  {/* Top Row: Side, Instrument, Status */}
                  <View style={styles.orderHeader}>
                    <View style={styles.orderTitleCol}>
                      <View style={styles.sideBadgeRow}>
                        <View style={[styles.sideBadge, isBuy ? styles.sideBuy : styles.sideSell]}>
                          <Text style={[styles.sideText, isBuy ? styles.textBuy : styles.textSell]}>
                            {ord.side}
                          </Text>
                        </View>
                        <Text style={styles.typeText}>{ord.type}</Text>
                        <Text style={styles.stratText}>• {ord.strategyName}</Text>
                      </View>
                      <Text style={styles.instrumentText}>{ord.instrument}</Text>
                    </View>

                    {/* Status Pill */}
                    <View style={[
                      styles.statusPill,
                      isExecuted ? styles.pillExecuted : isPending ? styles.pillPending : styles.pillRejected
                    ]}>
                      <Text style={[
                        styles.statusText,
                        isExecuted ? styles.textExecuted : isPending ? styles.textPending : styles.textRejected
                      ]}>
                        {ord.status}
                      </Text>
                    </View>
                  </View>

                  {/* Quantity & Executed Price Grid */}
                  <View style={styles.detailsGrid}>
                    <View style={styles.detailCol}>
                      <Text style={styles.detailLabel}>Quantity</Text>
                      <Text style={styles.detailVal}>{ord.qty} units</Text>
                    </View>
                    <View style={styles.detailCol}>
                      <Text style={styles.detailLabel}>Price</Text>
                      <Text style={styles.detailVal}>${ord.price.toFixed(2)}</Text>
                    </View>
                    <View style={styles.detailCol}>
                      <Text style={styles.detailLabel}>Time</Text>
                      <Text style={styles.detailVal}>{ord.timestamp}</Text>
                    </View>
                  </View>

                  {/* Footer: Broker Order ID */}
                  <View style={styles.orderFooter}>
                    <Text style={styles.brokerRefText}>
                      Broker Ref: <Text style={styles.brokerIdHighlight}>{ord.brokerOrderId}</Text>
                    </Text>
                    {ord.rejectionReason && (
                      <Text style={styles.rejectReasonText}>{ord.rejectionReason}</Text>
                    )}
                  </View>
                </Card>
              );
            })
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(240, 246, 255, 0.85)',
    borderRadius: BorderRadius.round,
    padding: 2.5,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.borderGlass,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 5.5,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: '#FFFFFF',
    ...Shadows.subtle,
  },
  filterText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl * 2,
  },
  orderCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderTitleCol: {
    flex: 1,
  },
  sideBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  sideBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  sideBuy: {
    backgroundColor: Colors.primaryLight,
  },
  sideSell: {
    backgroundColor: Colors.accentCoralLight,
  },
  sideText: {
    fontSize: 8.5,
    fontWeight: '800',
  },
  textBuy: {
    color: Colors.primary,
  },
  textSell: {
    color: Colors.accentCoral,
  },
  typeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  stratText: {
    fontSize: 9.5,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  instrumentText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: BorderRadius.round,
  },
  pillExecuted: {
    backgroundColor: Colors.accentGreenLight,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  pillPending: {
    backgroundColor: Colors.accentAmberLight,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  pillRejected: {
    backgroundColor: Colors.accentCoralLight,
    borderWidth: 1,
    borderColor: 'rgba(250, 90, 90, 0.2)',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
  },
  textExecuted: {
    color: Colors.accentGreen,
  },
  textPending: {
    color: Colors.accentAmber,
  },
  textRejected: {
    color: Colors.accentCoral,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(240, 246, 255, 0.75)',
    borderRadius: BorderRadius.md,
    padding: 6,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.08)',
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 8.5,
    color: Colors.textTertiary,
    fontWeight: '600',
    marginBottom: 1,
  },
  detailVal: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 1,
  },
  brokerRefText: {
    fontSize: 9.5,
    color: Colors.textTertiary,
  },
  brokerIdHighlight: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  rejectReasonText: {
    fontSize: 9.5,
    color: Colors.accentCoral,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 3,
  },
});
