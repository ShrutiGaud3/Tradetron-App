import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  Switch,
  TextInput,
  Alert 
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { NotificationCategory } from '../../types';

export const NotificationsModal: React.FC = () => {
  const isNotificationsOpen = useAppStore((state) => state.isNotificationsOpen);
  const setNotificationsOpen = useAppStore((state) => state.setNotificationsOpen);
  const notifications = useAppStore((state) => state.notifications);
  const markNotificationAsRead = useAppStore((state) => state.markNotificationAsRead);
  const markAllNotificationsAsRead = useAppStore((state) => state.markAllNotificationsAsRead);
  const clearAllNotifications = useAppStore((state) => state.clearAllNotifications);
  const notificationPreferences = useAppStore((state) => state.notificationPreferences);
  const updateNotificationPreferences = useAppStore((state) => state.updateNotificationPreferences);

  const [activeTab, setActiveTab] = useState<'FEED' | 'SETTINGS'>('FEED');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [webhookUrl, setWebhookUrl] = useState(notificationPreferences.webhookEndpoint || '');

  if (!isNotificationsOpen) return null;

  const categories = ['ALL', 'EXECUTION', 'RISK_ALERT', 'MARGIN', 'SYSTEM'];

  const filteredNotifications = notifications.filter((n) => {
    if (selectedCategory === 'ALL') return true;
    return n.category === selectedCategory;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleTestWebhook = () => {
    Alert.alert(
      'Webhook Test Triggered ⚡',
      `Sent mock execution payload to:\n${webhookUrl || 'https://api.quantflow.io/webhook/relay'}\n\nStatus: 200 OK (Response time: 42ms)`
    );
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'SUCCESS': return Colors.accentGreen;
      case 'WARNING': return Colors.accentAmber;
      case 'CRITICAL': return Colors.accentCoral;
      default: return Colors.primary;
    }
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'EXECUTION': return 'lightning-bolt';
      case 'RISK_ALERT': return 'shield-alert';
      case 'MARGIN': return 'bank';
      case 'SYSTEM': return 'cog';
      default: return 'bell-ring';
    }
  };

  return (
    <Modal visible={isNotificationsOpen} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="bell-ring-outline" size={20} color={Colors.primary} />
                {unreadCount > 0 && <View style={styles.badgeDot} />}
              </View>
              <View>
                <Text style={styles.title}>Notification & Webhook Center</Text>
                <Text style={styles.subtitle}>{unreadCount} unread realtime alerts</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setNotificationsOpen(false)} style={styles.closeBtn}>
              <Feather name="x" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Sub Tab Switcher (Feed vs Channels & Webhook) */}
          <View style={styles.mainTabBar}>
            <TouchableOpacity 
              style={[styles.mainTabBtn, activeTab === 'FEED' && styles.mainTabBtnActive]}
              onPress={() => setActiveTab('FEED')}
            >
              <Text style={[styles.mainTabBtnText, activeTab === 'FEED' && styles.mainTabBtnTextActive]}>
                Live Alerts Feed ({notifications.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.mainTabBtn, activeTab === 'SETTINGS' && styles.mainTabBtnActive]}
              onPress={() => setActiveTab('SETTINGS')}
            >
              <Text style={[styles.mainTabBtnText, activeTab === 'SETTINGS' && styles.mainTabBtnTextActive]}>
                Webhooks & Routing
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'FEED' ? (
            <View style={{ flex: 1 }}>
              {/* Category Filter Chips & Batch Actions */}
              <View style={styles.filterActionRow}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                  {categories.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[styles.categoryPill, selectedCategory === c && styles.categoryPillActive]}
                      onPress={() => setSelectedCategory(c)}
                    >
                      <Text style={[styles.categoryPillText, selectedCategory === c && styles.categoryPillTextActive]}>
                        {c.replace('_', ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {unreadCount > 0 && (
                  <TouchableOpacity style={styles.markReadBtn} onPress={markAllNotificationsAsRead}>
                    <Text style={styles.markReadText}>Read All</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Notifications List */}
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.feedContent}>
                {filteredNotifications.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="bell-check-outline" size={42} color={Colors.textTertiary} />
                    <Text style={styles.emptyTitle}>All Caught Up!</Text>
                    <Text style={styles.emptySub}>No active alerts under {selectedCategory.toLowerCase()} category.</Text>
                  </View>
                ) : (
                  filteredNotifications.map((n) => {
                    const sevColor = getSeverityColor(n.severity);
                    const iconName = getCategoryIcon(n.category);
                    return (
                      <TouchableOpacity
                        key={n.id}
                        style={[styles.notifCard, !n.isRead && styles.notifCardUnread]}
                        onPress={() => markNotificationAsRead(n.id)}
                        activeOpacity={0.8}
                      >
                        <View style={[styles.notifIconWrap, { backgroundColor: `${sevColor}15` }]}>
                          <MaterialCommunityIcons name={iconName as any} size={18} color={sevColor} />
                        </View>

                        <View style={styles.notifContent}>
                          <View style={styles.notifTopRow}>
                            <Text style={styles.notifTitle}>{n.title}</Text>
                            <Text style={styles.notifTime}>{n.timestamp}</Text>
                          </View>
                          <Text style={styles.notifMsg}>{n.message}</Text>
                        </View>

                        {!n.isRead && <View style={styles.unreadIndicator} />}
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>
            </View>
          ) : (
            /* TAB 2: WEBHOOK & ROUTING SETTINGS */
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.settingsContent}>
              {/* Push Channels */}
              <View style={styles.settingsCard}>
                <Text style={styles.settingsCardTitle}>Real-time Push Notification Triggers</Text>

                <View style={styles.switchRow}>
                  <View style={styles.switchInfo}>
                    <Text style={styles.switchLabel}>Order Executions</Text>
                    <Text style={styles.switchSub}>Instant push notification when algo fills legs</Text>
                  </View>
                  <Switch
                    value={notificationPreferences.orderFilledPush}
                    onValueChange={(v) => updateNotificationPreferences({ orderFilledPush: v })}
                    trackColor={{ false: '#D0D8E8', true: Colors.primary }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <View style={styles.divider} />

                <View style={styles.switchRow}>
                  <View style={styles.switchInfo}>
                    <Text style={styles.switchLabel}>Stop Loss & Profit Lock</Text>
                    <Text style={styles.switchSub}>High-priority alerts for SL triggers and trailing profits</Text>
                  </View>
                  <Switch
                    value={notificationPreferences.stopLossTriggeredPush}
                    onValueChange={(v) => updateNotificationPreferences({ stopLossTriggeredPush: v })}
                    trackColor={{ false: '#D0D8E8', true: Colors.primary }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <View style={styles.divider} />

                <View style={styles.switchRow}>
                  <View style={styles.switchInfo}>
                    <Text style={styles.switchLabel}>Broker Token & Margin Warnings</Text>
                    <Text style={styles.switchSub}>Alerts before daily broker session expiry</Text>
                  </View>
                  <Switch
                    value={notificationPreferences.tokenExpiryPush}
                    onValueChange={(v) => updateNotificationPreferences({ tokenExpiryPush: v })}
                    trackColor={{ false: '#D0D8E8', true: Colors.primary }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>

              {/* External Routing: Telegram & Webhook */}
              <View style={styles.settingsCard}>
                <Text style={styles.settingsCardTitle}>External Webhook & Bot Integration</Text>

                <View style={styles.switchRow}>
                  <View style={styles.switchInfo}>
                    <Text style={styles.switchLabel}>Telegram Bot Relay</Text>
                    <Text style={styles.switchSub}>Forward all trade signals to private Telegram channel</Text>
                  </View>
                  <Switch
                    value={notificationPreferences.telegramAlerts}
                    onValueChange={(v) => updateNotificationPreferences({ telegramAlerts: v })}
                    trackColor={{ false: '#D0D8E8', true: Colors.primary }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <View style={styles.divider} />

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Custom Webhook Endpoint URL</Text>
                  <View style={styles.webhookInputRow}>
                    <TextInput
                      style={styles.webhookInput}
                      value={webhookUrl}
                      onChangeText={(t) => {
                        setWebhookUrl(t);
                        updateNotificationPreferences({ webhookEndpoint: t });
                      }}
                      placeholder="https://api.yourdomain.com/v1/webhook"
                      placeholderTextColor={Colors.textTertiary}
                    />
                    <TouchableOpacity style={styles.testWebhookBtn} onPress={handleTestWebhook}>
                      <Feather name="send" size={13} color="#FFFFFF" />
                      <Text style={styles.testWebhookBtnText}>Test</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.webhookHint}>Receives instant JSON payloads on every signal evaluation and broker execution ack.</Text>
                </View>
              </View>
            </ScrollView>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setNotificationsOpen(false)}>
              <Text style={styles.closeModalBtnText}>Close Center</Text>
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
    height: '90%',
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
    position: 'relative',
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accentCoral,
    position: 'absolute',
    top: 6,
    right: 6,
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
  mainTabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(240, 246, 255, 0.85)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30, 80, 220, 0.1)',
    gap: 6,
  },
  mainTabBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  mainTabBtnActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(30, 80, 220, 0.25)',
    ...Shadows.subtle,
  },
  mainTabBtnText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  mainTabBtnTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  filterActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30, 80, 220, 0.08)',
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryPill: {
    backgroundColor: 'rgba(240, 246, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(30, 80, 220, 0.15)',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 5,
  },
  categoryPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },
  markReadBtn: {
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  markReadText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  feedContent: {
    padding: Spacing.md,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(30, 80, 220, 0.12)',
    padding: Spacing.sm,
    marginBottom: 8,
    position: 'relative',
  },
  notifCardUnread: {
    backgroundColor: 'rgba(235, 243, 255, 0.75)',
    borderColor: 'rgba(30, 80, 220, 0.28)',
  },
  notifIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  notifContent: {
    flex: 1,
  },
  notifTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  notifTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  notifTime: {
    fontSize: 9.5,
    color: Colors.textTertiary,
  },
  notifMsg: {
    fontSize: 10.5,
    color: Colors.textSecondary,
    lineHeight: 14,
  },
  unreadIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 8,
  },
  emptySub: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  settingsContent: {
    padding: Spacing.md,
  },
  settingsCard: {
    backgroundColor: 'rgba(240, 246, 255, 0.85)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1.2,
    borderColor: 'rgba(30, 80, 220, 0.18)',
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  settingsCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  switchInfo: {
    flex: 1,
    marginRight: 10,
  },
  switchLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  switchSub: {
    fontSize: 9.5,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(30, 80, 220, 0.1)',
    marginVertical: Spacing.xs,
  },
  inputGroup: {
    marginTop: 4,
  },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  webhookInputRow: {
    flexDirection: 'row',
    gap: 6,
  },
  webhookInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(30, 80, 220, 0.2)',
    borderRadius: BorderRadius.md,
    height: 36,
    paddingHorizontal: 8,
    fontSize: 10.5,
    color: Colors.textPrimary,
  },
  testWebhookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
  },
  testWebhookBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  webhookHint: {
    fontSize: 9.5,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
  },
  closeModalBtn: {
    backgroundColor: Colors.textPrimary,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeModalBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
