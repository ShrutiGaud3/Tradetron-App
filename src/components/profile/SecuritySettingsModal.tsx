import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../../theme';
import { Card } from '../common/Card';
import { useAppStore } from '../../store/useAppStore';

interface SecuritySettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SecuritySettingsModal: React.FC<SecuritySettingsModalProps> = ({
  visible,
  onClose,
}) => {
  const currentPin = useAppStore((state) => state.currentPin);
  const isBiometricEnabled = useAppStore((state) => state.isBiometricEnabled);
  const toggleBiometrics = useAppStore((state) => state.toggleBiometrics);
  const sessionTimeoutMinutes = useAppStore((state) => state.sessionTimeoutMinutes);
  const setSessionTimeout = useAppStore((state) => state.setSessionTimeout);
  const updatePin = useAppStore((state) => state.updatePin);

  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isChangingPin, setIsChangingPin] = useState(false);

  const handleChangePin = () => {
    if (oldPin.length !== 4) {
      Alert.alert('Invalid PIN', 'Please enter your 4-digit current PIN.');
      return;
    }
    if (newPin.length !== 4) {
      Alert.alert('Invalid PIN', 'New PIN must be exactly 4 digits.');
      return;
    }
    if (newPin !== confirmPin) {
      Alert.alert('Mismatch', 'New PIN and Confirm PIN do not match.');
      return;
    }

    const success = updatePin(oldPin, newPin);
    if (!success) {
      Alert.alert('Incorrect Current PIN', 'The current PIN entered is incorrect.');
      return;
    }

    setOldPin('');
    setNewPin('');
    setConfirmPin('');
    setIsChangingPin(false);
    Alert.alert('PIN Updated', 'Your 4-digit security PIN has been updated successfully.');
  };

  const handleTerminateOtherSessions = () => {
    Alert.alert(
      'Terminate Sessions',
      'Sign out of all other active browsers and devices? You will remain logged in on this phone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Terminate All',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Sessions Cleared', 'All other active web & tablet sessions have been revoked.');
          },
        },
      ]
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
                <MaterialCommunityIcons name="shield-lock-outline" size={20} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Security & Access Control</Text>
                <Text style={styles.headerSubtitle}>PIN, Biometrics & Session Tokens</Text>
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
            {/* Biometric Toggle Card */}
            <Card style={styles.settingCard} variant="blueGlass">
              <View style={styles.settingRow}>
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="fingerprint" size={22} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingTitle}>Biometric Unlock</Text>
                  <Text style={styles.settingSub}>Use FaceID or Fingerprint for rapid session unlock</Text>
                </View>
                <Switch
                  value={isBiometricEnabled}
                  onValueChange={toggleBiometrics}
                  trackColor={{ false: '#CBD5E1', true: Colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </Card>

            {/* Change 4-Digit Security PIN Section */}
            <Text style={styles.sectionHeading}>4-Digit Security PIN</Text>
            <Card style={styles.settingCard} variant="glass">
              {!isChangingPin ? (
                <View style={styles.settingRow}>
                  <View style={styles.iconCircle}>
                    <MaterialCommunityIcons name="numeric" size={22} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.settingTitle}>Security PIN Lock</Text>
                    <Text style={styles.settingSub}>Active PIN: • • • • (Used on cold app launches)</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.actionPillBtn}
                    onPress={() => setIsChangingPin(true)}
                  >
                    <Text style={styles.actionPillBtnText}>Change</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.pinChangeForm}>
                  <View style={styles.pinFormHeader}>
                    <Text style={styles.pinFormTitle}>Update Security PIN</Text>
                    <TouchableOpacity onPress={() => setIsChangingPin(false)}>
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.pinInputRow}>
                    <Text style={styles.pinInputLabel}>Current PIN</Text>
                    <TextInput
                      style={styles.pinInput}
                      keyboardType="numeric"
                      maxLength={4}
                      secureTextEntry
                      placeholder="••••"
                      placeholderTextColor={Colors.textTertiary}
                      value={oldPin}
                      onChangeText={setOldPin}
                    />
                  </View>

                  <View style={styles.pinInputRow}>
                    <Text style={styles.pinInputLabel}>New 4-Digit PIN</Text>
                    <TextInput
                      style={styles.pinInput}
                      keyboardType="numeric"
                      maxLength={4}
                      secureTextEntry
                      placeholder="••••"
                      placeholderTextColor={Colors.textTertiary}
                      value={newPin}
                      onChangeText={setNewPin}
                    />
                  </View>

                  <View style={styles.pinInputRow}>
                    <Text style={styles.pinInputLabel}>Confirm New PIN</Text>
                    <TextInput
                      style={styles.pinInput}
                      keyboardType="numeric"
                      maxLength={4}
                      secureTextEntry
                      placeholder="••••"
                      placeholderTextColor={Colors.textTertiary}
                      value={confirmPin}
                      onChangeText={setConfirmPin}
                    />
                  </View>

                  <TouchableOpacity style={styles.savePinBtn} onPress={handleChangePin} activeOpacity={0.8}>
                    <Text style={styles.savePinBtnText}>Save New PIN</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Card>

            {/* Auto-Lock Session Timeout */}
            <Text style={styles.sectionHeading}>Auto-Lock Inactivity Timeout</Text>
            <View style={styles.timeoutOptionsRow}>
              {[0, 5, 15, 30, 60].map((mins) => {
                const isSelected = sessionTimeoutMinutes === mins;
                const label = mins === 0 ? 'Immediate' : `${mins}m`;
                return (
                  <TouchableOpacity
                    key={mins}
                    style={[styles.timeoutBtn, isSelected && styles.timeoutBtnActive]}
                    onPress={() => setSessionTimeout(mins)}
                  >
                    <Text style={[styles.timeoutText, isSelected && styles.timeoutTextActive]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Active Device Sessions */}
            <Text style={styles.sectionHeading}>Active Device Sessions</Text>
            <Card style={styles.settingCard} variant="glass">
              <View style={styles.sessionItem}>
                <MaterialCommunityIcons name="cellphone" size={20} color={Colors.accentGreen} />
                <View style={{ flex: 1 }}>
                  <View style={styles.sessionTitleRow}>
                    <Text style={styles.sessionTitle}>This Device (Mobile App)</Text>
                    <View style={styles.thisDeviceBadge}>
                      <Text style={styles.thisDeviceText}>CURRENT</Text>
                    </View>
                  </View>
                  <Text style={styles.sessionSub}>React Native / Expo SDK • IP: 103.24.89.12</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.sessionItem}>
                <MaterialCommunityIcons name="laptop" size={20} color={Colors.textSecondary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.sessionTitle}>Chrome on MacOS (Web Dashboard)</Text>
                  <Text style={styles.sessionSub}>Mumbai, India • Last active 2 hours ago</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.terminateBtn} 
                onPress={handleTerminateOtherSessions}
                activeOpacity={0.8}
              >
                <Feather name="log-out" size={13} color={Colors.accentCoral} />
                <Text style={styles.terminateBtnText}>Sign Out All Other Devices</Text>
              </TouchableOpacity>
            </Card>
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
  scrollBody: {
    paddingHorizontal: Spacing.md,
  },
  scrollContent: {
    paddingVertical: 14,
    gap: 12,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  settingCard: {
    padding: 12,
    borderRadius: 14,
    gap: 10,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  settingSub: {
    fontSize: 10.5,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  actionPillBtn: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
  },
  actionPillBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  pinChangeForm: {
    gap: 8,
  },
  pinFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pinFormTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cancelText: {
    fontSize: 11,
    color: Colors.accentCoral,
    fontWeight: '600',
  },
  pinInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pinInputLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  pinInput: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 4,
    color: Colors.textPrimary,
    minWidth: 70,
    textAlign: 'center',
    paddingVertical: 2,
  },
  savePinBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  savePinBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  timeoutOptionsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  timeoutBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeoutBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeoutText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  timeoutTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sessionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sessionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  thisDeviceBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  thisDeviceText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: Colors.accentGreen,
  },
  sessionSub: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  terminateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    marginTop: 4,
  },
  terminateBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accentCoral,
  },
});
