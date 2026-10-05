import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../../theme';
import { Card } from '../common/Card';

interface LegalDisclosuresModalProps {
  visible: boolean;
  onClose: () => void;
}

export const LegalDisclosuresModal: React.FC<LegalDisclosuresModalProps> = ({
  visible,
  onClose,
}) => {
  const [activeSection, setActiveSection] = useState<'SEBI' | 'RISK' | 'PRIVACY' | 'TERMS'>('SEBI');

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconContainer}>
                <MaterialCommunityIcons name="scale-balance" size={20} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Legal & Regulatory Disclosures</Text>
                <Text style={styles.headerSubtitle}>SEBI Compliance & Risk Disclosures</Text>
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

          {/* Section Selector Pills */}
          <View style={styles.tabRow}>
            {(['SEBI', 'RISK', 'PRIVACY', 'TERMS'] as const).map((sec) => {
              const isSelected = activeSection === sec;
              const label = sec === 'SEBI' ? 'SEBI Mandates' : sec === 'RISK' ? 'Risk Disclosure' : sec === 'PRIVACY' ? 'Data & Keys' : 'Terms of Use';
              return (
                <TouchableOpacity
                  key={sec}
                  style={[styles.tabBtn, isSelected && styles.tabBtnActive]}
                  onPress={() => setActiveSection(sec)}
                >
                  <Text style={[styles.tabBtnText, isSelected && styles.tabBtnTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <ScrollView 
            style={styles.scrollBody} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {activeSection === 'SEBI' && (
              <View style={styles.contentSection}>
                <Card style={styles.infoCard} variant="blueGlass">
                  <View style={styles.infoCardHeader}>
                    <MaterialCommunityIcons name="shield-check" size={20} color={Colors.accentGreen} />
                    <Text style={styles.infoCardTitle}>SEBI Regulatory Framework Compliance</Text>
                  </View>
                  <Text style={styles.bodyParagraph}>
                    Tradetron is a technological middleware application designed to automate trade execution through official Broker APIs (e.g. Zerodha Kite Connect, Angel One SmartAPI, Upstox API).
                  </Text>
                  <Text style={styles.bodyParagraph}>
                    1. <Text style={styles.boldText}>No Guaranteed Returns:</Text> Tradetron does not offer advisory services or promise fixed financial returns. All strategy backtests are simulated representations of past performance.
                  </Text>
                  <Text style={styles.bodyParagraph}>
                    2. <Text style={styles.boldText}>User Authorization & 2FA:</Text> In compliance with SEBI 2FA circulars, users must log in daily with their broker TOTP/credentials to generate a session execution token.
                  </Text>
                </Card>
              </View>
            )}

            {activeSection === 'RISK' && (
              <View style={styles.contentSection}>
                <Card style={styles.infoCard} variant="glass">
                  <View style={styles.infoCardHeader}>
                    <MaterialCommunityIcons name="alert-decagram" size={20} color={Colors.accentCoral} />
                    <Text style={styles.infoCardTitle}>Derivatives & Algorithmic Risk Factors</Text>
                  </View>
                  <Text style={styles.bodyParagraph}>
                    • <Text style={styles.boldText}>Slippage & Market Latency:</Text> High-volatility market events (such as RBI policy or budget announcements) may cause market order fills at prices different from trigger prices.
                  </Text>
                  <Text style={styles.bodyParagraph}>
                    • <Text style={styles.boldText}>Network & Broker Downtime:</Text> System delays or API throttling by exchange servers may impede real-time order placement. Traders should utilize the Tradetron Emergency Kill Switch to manage risk.
                  </Text>
                  <Text style={styles.bodyParagraph}>
                    • <Text style={styles.boldText}>Margin Calls:</Text> Overnight multi-leg option writing strategies require adequate margin buffers to withstand span/exposure margin increases.
                  </Text>
                </Card>
              </View>
            )}

            {activeSection === 'PRIVACY' && (
              <View style={styles.contentSection}>
                <Card style={styles.infoCard} variant="blueGlass">
                  <View style={styles.infoCardHeader}>
                    <MaterialCommunityIcons name="lock-check" size={20} color={Colors.primary} />
                    <Text style={styles.infoCardTitle}>API Key Encryption & Zero-Custody</Text>
                  </View>
                  <Text style={styles.bodyParagraph}>
                    1. <Text style={styles.boldText}>AES-256 GCM Encryption:</Text> Your broker API keys and secrets are encrypted at rest using hardware-backed security modules.
                  </Text>
                  <Text style={styles.bodyParagraph}>
                    2. <Text style={styles.boldText}>Zero Custody Architecture:</Text> Tradetron never holds, transfers, or accesses your trading funds or demat securities. All order execution happens directly within your verified broker account.
                  </Text>
                </Card>
              </View>
            )}

            {activeSection === 'TERMS' && (
              <View style={styles.contentSection}>
                <Card style={styles.infoCard} variant="glass">
                  <View style={styles.infoCardHeader}>
                    <MaterialCommunityIcons name="file-document-check-outline" size={20} color={Colors.textSecondary} />
                    <Text style={styles.infoCardTitle}>Software License & Usage Terms</Text>
                  </View>
                  <Text style={styles.bodyParagraph}>
                    By deploying algorithmic strategies on Tradetron, you agree to our Terms of Service, Acceptable Use Policy, and Fair Use API limits.
                  </Text>
                  <Text style={styles.bodyParagraph}>
                    Last updated: October 2026 • Tradetron Technologies Ltd.
                  </Text>
                </Card>
              </View>
            )}
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
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
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
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 6,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  tabBtnActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
  },
  tabBtnText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabBtnTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  scrollBody: {
    paddingHorizontal: Spacing.md,
  },
  scrollContent: {
    paddingVertical: 14,
  },
  contentSection: {
    gap: 10,
  },
  infoCard: {
    padding: 14,
    borderRadius: 14,
    gap: 10,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  bodyParagraph: {
    fontSize: 11.5,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
