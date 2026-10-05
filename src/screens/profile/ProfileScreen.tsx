import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Alert 
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Colors, Spacing, BorderRadius, Shadows } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { KycDetailsModal } from '../../components/profile/KycDetailsModal';
import { SecuritySettingsModal } from '../../components/profile/SecuritySettingsModal';
import { SubscriptionPlansModal } from '../../components/profile/SubscriptionPlansModal';
import { LegalDisclosuresModal } from '../../components/profile/LegalDisclosuresModal';
import { HelpSupportModal } from '../../components/profile/HelpSupportModal';

interface ProfileScreenProps {
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout }) => {
  const user = useAppStore((state) => state.user);
  const kyc = useAppStore((state) => state.kyc);
  const supportTickets = useAppStore((state) => state.supportTickets);
  const platformInvoices = useAppStore((state) => state.platformInvoices);

  const isKycModalOpen = useAppStore((state) => state.isKycModalOpen);
  const setKycModalOpen = useAppStore((state) => state.setKycModalOpen);
  const isSecurityModalOpen = useAppStore((state) => state.isSecurityModalOpen);
  const setSecurityModalOpen = useAppStore((state) => state.setSecurityModalOpen);
  const isPlansModalOpen = useAppStore((state) => state.isPlansModalOpen);
  const setPlansModalOpen = useAppStore((state) => state.setPlansModalOpen);
  const isLegalModalOpen = useAppStore((state) => state.isLegalModalOpen);
  const setLegalModalOpen = useAppStore((state) => state.setLegalModalOpen);
  const isHelpModalOpen = useAppStore((state) => state.isHelpModalOpen);
  const setHelpModalOpen = useAppStore((state) => state.setHelpModalOpen);
  const setNotificationsOpen = useAppStore((state) => state.setNotificationsOpen);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of Tradetron?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: onLogout 
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#EAF2F9', '#F0F5FA', '#F6F9FD']}
        style={StyleSheet.absoluteFill}
      />

      <Header title="Tradetron" subtitle="User Profile & Settings" showAvatar={false} />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Hero Card */}
        <Card style={styles.profileCard} variant="blueGlass">
          <View style={styles.avatarRow}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
              <View style={styles.onlineBadge} />
            </View>

            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{user.name}</Text>
                <MaterialCommunityIcons name="check-decagram" size={16} color={Colors.primary} />
              </View>

              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userPhone}>{user.phone}</Text>
            </View>

            <TouchableOpacity 
              style={styles.planPillBtn}
              onPress={() => setPlansModalOpen(true)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="crown" size={13} color="#F59E0B" />
              <Text style={styles.planPillText}>{user.plan}</Text>
            </TouchableOpacity>
          </View>

          {/* KYC Status Clickable Banner */}
          <TouchableOpacity 
            style={styles.kycBanner}
            onPress={() => setKycModalOpen(true)}
            activeOpacity={0.8}
          >
            <View style={styles.kycLeft}>
              <MaterialCommunityIcons name="shield-check" size={20} color={Colors.accentGreen} />
              <View>
                <Text style={styles.kycTitle}>KYC Status: {kyc.kycStatus}</Text>
                <Text style={styles.kycDesc}>PAN {kyc.panNumber} • SEBI Mandate Compliant</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={16} color={Colors.accentGreen} />
          </TouchableOpacity>
        </Card>

        {/* Account & Billing */}
        <Text style={styles.sectionHeader}>Subscriptions & Account Capacity</Text>
        <Card style={styles.menuCard} variant="glass">
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => setPlansModalOpen(true)}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconBadge, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
                <MaterialCommunityIcons name="crown-outline" size={18} color="#D97706" />
              </View>
              <View>
                <Text style={styles.menuTitle}>Platform Plan & Invoices</Text>
                <Text style={styles.menuSubtitle}>{user.plan} • {platformInvoices.length} Paid Receipts</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => setKycModalOpen(true)}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconBadge, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                <MaterialCommunityIcons name="shield-account-outline" size={18} color={Colors.accentGreen} />
              </View>
              <View>
                <Text style={styles.menuTitle}>KYC Documents & Demat Linkage</Text>
                <Text style={styles.menuSubtitle}>DigiLocker Verified ID & CDSL Demat</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>
        </Card>

        {/* Security & Access Controls */}
        <Text style={styles.sectionHeader}>Security & Authorization</Text>
        <Card style={styles.menuCard} variant="glass">
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => setSecurityModalOpen(true)}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconBadge, { backgroundColor: 'rgba(37, 99, 235, 0.12)' }]}>
                <MaterialCommunityIcons name="shield-key-outline" size={18} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.menuTitle}>Security PIN & Biometric Lock</Text>
                <Text style={styles.menuSubtitle}>4-Digit Quick PIN, FaceID & Inactivity Auto-Lock</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => setSecurityModalOpen(true)}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconBadge, { backgroundColor: 'rgba(148, 163, 184, 0.15)' }]}>
                <MaterialCommunityIcons name="devices" size={18} color={Colors.textSecondary} />
              </View>
              <View>
                <Text style={styles.menuTitle}>Active Device Sessions</Text>
                <Text style={styles.menuSubtitle}>Manage active sessions & remote revocation</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>
        </Card>

        {/* Preferences, Notifications & Legal */}
        <Text style={styles.sectionHeader}>Alerts, Legal & Compliance</Text>
        <Card style={styles.menuCard} variant="glass">
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => setNotificationsOpen(true)}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconBadge, { backgroundColor: 'rgba(37, 99, 235, 0.1)' }]}>
                <Feather name="bell" size={18} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.menuTitle}>Notification Preferences</Text>
                <Text style={styles.menuSubtitle}>SL Triggers, Margin Alerts, Telegram & Webhook</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => setLegalModalOpen(true)}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconBadge, { backgroundColor: 'rgba(148, 163, 184, 0.15)' }]}>
                <MaterialCommunityIcons name="scale-balance" size={18} color={Colors.textSecondary} />
              </View>
              <View>
                <Text style={styles.menuTitle}>SEBI Disclosures & Risk Mandates</Text>
                <Text style={styles.menuSubtitle}>Algorithmic trading framework & privacy policy</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>
        </Card>

        {/* 24/7 Desk Help & Support */}
        <Text style={styles.sectionHeader}>Help & Support</Text>
        <Card style={styles.menuCard} variant="glass">
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => setHelpModalOpen(true)}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconBadge, { backgroundColor: 'rgba(37, 99, 235, 0.1)' }]}>
                <MaterialCommunityIcons name="headset" size={18} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.menuTitle}>24/7 Quant Desk & Ticket Center</Text>
                <Text style={styles.menuSubtitle}>
                  FAQs, Execution Debugging & {supportTickets.length} Support Tickets
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>
        </Card>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutBtn} 
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <Feather name="log-out" size={16} color={Colors.accentCoral} />
          <Text style={styles.logoutBtnText}>Log Out of Tradetron</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Module 8 Modals */}
      <KycDetailsModal
        visible={isKycModalOpen}
        onClose={() => setKycModalOpen(false)}
      />

      <SecuritySettingsModal
        visible={isSecurityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
      />

      <SubscriptionPlansModal
        visible={isPlansModalOpen}
        onClose={() => setPlansModalOpen(false)}
      />

      <LegalDisclosuresModal
        visible={isLegalModalOpen}
        onClose={() => setLegalModalOpen(false)}
      />

      <HelpSupportModal
        visible={isHelpModalOpen}
        onClose={() => setHelpModalOpen(false)}
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
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxxl * 2,
    gap: 8,
  },
  profileCard: {
    padding: 14,
    borderRadius: 16,
    gap: 12,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#CBD5E1',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: Colors.accentGreen,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  userEmail: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  userPhone: {
    fontSize: 10.5,
    color: Colors.textTertiary,
  },
  planPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  planPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
  },
  kycBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  kycLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  kycTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  kycDesc: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: 8,
    marginBottom: 2,
    paddingHorizontal: 4,
  },
  menuCard: {
    padding: 6,
    borderRadius: 14,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  menuIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  menuSubtitle: {
    fontSize: 10.5,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(226, 232, 240, 0.6)',
    marginHorizontal: 6,
  },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    marginTop: 12,
  },
  logoutBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.accentCoral,
  },
});
