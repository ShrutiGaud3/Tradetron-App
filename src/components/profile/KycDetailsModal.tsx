import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../../theme';
import { Card } from '../common/Card';
import { useAppStore } from '../../store/useAppStore';

interface KycDetailsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const KycDetailsModal: React.FC<KycDetailsModalProps> = ({
  visible,
  onClose,
}) => {
  const kyc = useAppStore((state) => state.kyc);
  const user = useAppStore((state) => state.user);

  const handleDownloadCertificate = () => {
    Alert.alert(
      'KYC Certificate Downloaded',
      'SEBI compliant verification certificate saved to your device as PDF.'
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconContainer}>
                <MaterialCommunityIcons name="shield-account" size={20} color={Colors.accentGreen} />
              </View>
              <View>
                <Text style={styles.headerTitle}>KYC & Identity Verification</Text>
                <Text style={styles.headerSubtitle}>SEBI & Exchange Regulatory Compliance</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.closeBtn} 
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="x" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollBody} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Status Hero Card */}
            <Card style={styles.statusHeroCard} variant="blueGlass">
              <View style={styles.statusHeroTop}>
                <View style={styles.statusIconBox}>
                  <MaterialCommunityIcons name="check-decagram" size={28} color={Colors.accentGreen} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.statusHeroTitle}>Full KYC Verified</Text>
                  <Text style={styles.statusHeroSub}>Verified on {kyc.verifiedDate} via DigiLocker</Text>
                </View>
                <View style={styles.activeTag}>
                  <Text style={styles.activeTagText}>ACTIVE</Text>
                </View>
              </View>

              <Text style={styles.statusDesc}>
                Your identity and demat linkage comply with SEBI master circular on algorithmic execution mandates.
              </Text>
            </Card>

            {/* Document Details Cards */}
            <Text style={styles.sectionHeading}>Verified Identification Documents</Text>

            <Card style={styles.docCard} variant="glass">
              <View style={styles.docRow}>
                <MaterialCommunityIcons name="card-account-details-outline" size={22} color={Colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.docLabel}>Permanent Account Number (PAN)</Text>
                  <Text style={styles.docValue}>{kyc.panNumber}</Text>
                </View>
                <View style={styles.verifiedBadge}>
                  <Feather name="check" size={12} color={Colors.accentGreen} />
                  <Text style={styles.verifiedBadgeText}>Verified</Text>
                </View>
              </View>
            </Card>

            <Card style={styles.docCard} variant="glass">
              <View style={styles.docRow}>
                <MaterialCommunityIcons name="fingerprint" size={22} color={Colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.docLabel}>Aadhaar (UIDAI Verified)</Text>
                  <Text style={styles.docValue}>{kyc.aadhaarMasked}</Text>
                </View>
                <View style={styles.verifiedBadge}>
                  <Feather name="check" size={12} color={Colors.accentGreen} />
                  <Text style={styles.verifiedBadgeText}>DigiLocker</Text>
                </View>
              </View>
            </Card>

            <Card style={styles.docCard} variant="glass">
              <View style={styles.docRow}>
                <MaterialCommunityIcons name="domain" size={22} color={Colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.docLabel}>Demat / DP ID Linkage</Text>
                  <Text style={styles.docValue}>{kyc.dematId}</Text>
                </View>
                <View style={styles.verifiedBadge}>
                  <Feather name="check" size={12} color={Colors.accentGreen} />
                  <Text style={styles.verifiedBadgeText}>Linked</Text>
                </View>
              </View>
            </Card>

            <Card style={styles.docCard} variant="glass">
              <View style={styles.docRow}>
                <MaterialCommunityIcons name="bank" size={22} color={Colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.docLabel}>Primary Bank Settlement Account</Text>
                  <Text style={styles.docValue}>{kyc.bankAccount}</Text>
                </View>
                <View style={styles.verifiedBadge}>
                  <Feather name="check" size={12} color={Colors.accentGreen} />
                  <Text style={styles.verifiedBadgeText}>IMPS Verified</Text>
                </View>
              </View>
            </Card>

            {/* SEBI Compliance Banner */}
            <View style={styles.complianceNoteBox}>
              <Feather name="info" size={14} color={Colors.textSecondary} />
              <Text style={styles.complianceNoteText}>
                Tradetron operates as a systematic execution technology bridge. Your funds and demat securities remain solely with your SEBI-registered broker accounts.
              </Text>
            </View>

            {/* Download Certificate Action */}
            <TouchableOpacity 
              style={styles.downloadBtn} 
              onPress={handleDownloadCertificate}
              activeOpacity={0.8}
            >
              <Feather name="download" size={14} color="#FFFFFF" />
              <Text style={styles.downloadBtnText}>Download KYC Certificate (PDF)</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 24,
    ...Shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.8)',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollBody: {
    paddingHorizontal: Spacing.md,
  },
  scrollContent: {
    paddingVertical: 14,
    gap: 10,
  },
  statusHeroCard: {
    padding: 14,
    borderRadius: 16,
    gap: 8,
  },
  statusHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusHeroTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  statusHeroSub: {
    fontSize: 10.5,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  activeTag: {
    backgroundColor: Colors.accentGreen,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statusDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  docCard: {
    padding: 12,
    borderRadius: 12,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  docLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: '600',
  },
  docValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  verifiedBadgeText: {
    fontSize: 9.5,
    color: Colors.accentGreen,
    fontWeight: '700',
  },
  complianceNoteBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  complianceNoteText: {
    fontSize: 10,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 14,
  },
  downloadBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    ...Shadows.button,
    marginTop: 4,
  },
  downloadBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
});
