import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  ScrollView, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../../theme';
import { BrokerAccount, BrokerCode, BrokerAuthType } from '../../types';
import { useAppStore } from '../../store/useAppStore';

interface BrokerConnectModalProps {
  visible: boolean;
  broker: BrokerAccount | null;
  onClose: () => void;
}

export const BrokerConnectModal: React.FC<BrokerConnectModalProps> = ({
  visible,
  broker,
  onClose,
}) => {
  const connectBroker = useAppStore((state) => state.connectBroker);
  const [authMethod, setAuthMethod] = useState<BrokerAuthType>('OAUTH');
  const [userId, setUserId] = useState(broker?.accountRef?.split(' ')[0] || '');
  const [apiKey, setApiKey] = useState('kite_live_99428xya');
  const [apiSecret, setApiSecret] = useState('sec_09874134');
  const [totpPin, setTotpPin] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleStartAuth = () => {
    if (!userId.trim()) {
      Alert.alert('Validation Error', 'Please enter your Broker User / Client ID');
      return;
    }

    setIsAuthenticating(true);

    // Simulate OAuth / API Handshake
    setTimeout(() => {
      setIsAuthenticating(false);
      if (broker) {
        connectBroker(broker.brokerCode, userId.trim(), authMethod);
        Alert.alert(
          'Broker Connected! 🚀',
          `${broker.brokerName} has been authorized. Real-time market feed & margin limits synced.`
        );
        onClose();
      }
    }, 1200);
  };

  if (!broker) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="bank" size={18} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.title}>Connect {broker.brokerName}</Text>
                <Text style={styles.subtitle}>SEBI Mandated 2FA API Token Handshake</Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
            {/* Auth Mode Toggle (OAuth vs API Key) */}
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tabBtn, authMethod === 'OAUTH' && styles.tabBtnActive]}
                onPress={() => setAuthMethod('OAUTH')}
              >
                <MaterialCommunityIcons name="link-variant" size={14} color={authMethod === 'OAUTH' ? Colors.primary : Colors.textTertiary} />
                <Text style={[styles.tabText, authMethod === 'OAUTH' && styles.tabTextActive]}>
                  Instant 1-Click OAuth
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.tabBtn, authMethod === 'API_KEY_TOTP' && styles.tabBtnActive]}
                onPress={() => setAuthMethod('API_KEY_TOTP')}
              >
                <MaterialCommunityIcons name="key-variant" size={14} color={authMethod === 'API_KEY_TOTP' ? Colors.primary : Colors.textTertiary} />
                <Text style={[styles.tabText, authMethod === 'API_KEY_TOTP' && styles.tabTextActive]}>
                  API Key + TOTP
                </Text>
              </TouchableOpacity>
            </View>

            {/* Input Fields */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Broker Client ID / User Code</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. ZT7821 or UP8819"
                placeholderTextColor={Colors.textTertiary}
                value={userId}
                onChangeText={setUserId}
                autoCapitalize="characters"
              />
            </View>

            {authMethod === 'API_KEY_TOTP' ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>API Key</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter broker API key"
                    placeholderTextColor={Colors.textTertiary}
                    value={apiKey}
                    onChangeText={setApiKey}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>API Secret</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter broker API secret"
                    placeholderTextColor={Colors.textTertiary}
                    secureTextEntry
                    value={apiSecret}
                    onChangeText={setApiSecret}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Authenticator 2FA / TOTP (Optional)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="6-digit TOTP code"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="number-pad"
                    maxLength={6}
                    value={totpPin}
                    onChangeText={setTotpPin}
                  />
                </View>
              </>
            ) : (
              <View style={styles.oauthInfoBox}>
                <MaterialCommunityIcons name="shield-check" size={20} color={Colors.primary} />
                <View style={styles.oauthTextCol}>
                  <Text style={styles.oauthTitle}>Direct In-App Authorization</Text>
                  <Text style={styles.oauthDesc}>
                    Clicking Authorize will securely connect to {broker.brokerName}'s login portal, fetch daily session tokens and store encrypted keys in KMS.
                  </Text>
                </View>
              </View>
            )}

            {/* KMS Security Disclaimer */}
            <View style={styles.securityBox}>
              <Feather name="lock" size={13} color={Colors.accentGreen} />
              <Text style={styles.securityText}>
                Credentials are never stored in plaintext. Session tokens expire daily at 23:59 IST per exchange regulations.
              </Text>
            </View>
          </ScrollView>

          {/* Action Button */}
          <TouchableOpacity 
            style={[styles.authBtn, isAuthenticating && { opacity: 0.8 }]} 
            activeOpacity={0.8}
            onPress={handleStartAuth}
            disabled={isAuthenticating}
          >
            {isAuthenticating ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <MaterialCommunityIcons name="shield-key" size={16} color="#FFFFFF" />
                <Text style={styles.authBtnText}>
                  {authMethod === 'OAUTH' ? `Authorize with ${broker.brokerName}` : 'Verify & Store API Keys'}
                </Text>
              </>
            )}
          </TouchableOpacity>
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
    maxHeight: '85%',
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
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    marginBottom: Spacing.md,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(240, 246, 255, 0.95)',
    borderRadius: BorderRadius.round,
    padding: 2.5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.borderGlass,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    ...Shadows.subtle,
  },
  tabText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  inputGroup: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 3,
  },
  textInput: {
    backgroundColor: 'rgba(240, 246, 255, 0.65)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.20)',
    fontWeight: '600',
  },
  oauthInfoBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(219, 234, 254, 0.50)',
    padding: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.25)',
    marginVertical: 4,
  },
  oauthTextCol: {
    flex: 1,
  },
  oauthTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  oauthDesc: {
    fontSize: 10,
    color: Colors.textSecondary,
    lineHeight: 14,
    marginTop: 2,
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.accentGreenLight,
    padding: 8,
    borderRadius: BorderRadius.md,
    marginTop: 6,
  },
  securityText: {
    flex: 1,
    fontSize: 9.5,
    color: Colors.textSecondary,
    lineHeight: 13,
  },
  authBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.round,
    paddingVertical: 12,
    ...Shadows.button,
  },
  authBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
