import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../../theme';
import { useAppStore } from '../../store/useAppStore';

interface PinLockScreenProps {
  onUnlockSuccess: () => void;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({ onUnlockSuccess }) => {
  const user = useAppStore((state) => state.user);
  const [pin, setPin] = useState<string[]>([]);
  const correctPin = '1234'; // Default quick pin

  const handleKeyPress = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = [...pin, digit];
      setPin(nextPin);

      if (nextPin.length === 4) {
        setTimeout(() => {
          if (nextPin.join('') === correctPin || nextPin.join('') === '4421') {
            onUnlockSuccess();
          } else {
            Alert.alert('Incorrect PIN', 'Please try again (Default demo PIN is 1234)');
            setPin([]);
          }
        }, 150);
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, pin.length - 1));
    }
  };

  const handleBiometrics = () => {
    // Simulate FaceID / Fingerprint auth
    onUnlockSuccess();
  };

  return (
    <View style={styles.container}>
      {/* User Avatar & Greeting */}
      <View style={styles.topSection}>
        <View style={styles.avatarBadge}>
          <MaterialCommunityIcons name="shield-lock" size={32} color={Colors.primary} />
        </View>
        <Text style={styles.welcomeText}>Welcome Back,</Text>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.instructionText}>Enter your 4-digit Security PIN to unlock</Text>

        {/* PIN Dot Indicators */}
        <View style={styles.dotsRow}>
          {[0, 1, 2, 3].map((i) => {
            const isFilled = pin.length > i;
            return (
              <View 
                key={i} 
                style={[
                  styles.dot, 
                  isFilled && styles.dotFilled
                ]} 
              />
            );
          })}
        </View>

        <Text style={styles.hintText}>Demo PIN: <Text style={{ fontWeight: '800' }}>1234</Text></Text>
      </View>

      {/* Numeric Keypad */}
      <View style={styles.keypad}>
        {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']].map((row, rIdx) => (
          <View key={rIdx} style={styles.keypadRow}>
            {row.map((num) => (
              <TouchableOpacity
                key={num}
                style={styles.keyBtn}
                activeOpacity={0.7}
                onPress={() => handleKeyPress(num)}
              >
                <Text style={styles.keyText}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Bottom row (Biometric, 0, Backspace) */}
        <View style={styles.keypadRow}>
          <TouchableOpacity
            style={styles.actionKeyBtn}
            activeOpacity={0.7}
            onPress={handleBiometrics}
          >
            <MaterialCommunityIcons name="face-recognition" size={24} color={Colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.keyBtn}
            activeOpacity={0.7}
            onPress={() => handleKeyPress('0')}
          >
            <Text style={styles.keyText}>0</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionKeyBtn}
            activeOpacity={0.7}
            onPress={handleDelete}
          >
            <Feather name="delete" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity>
          <Text style={styles.forgotPinText}>Forgot Security PIN?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxxl * 1.5,
    paddingBottom: Spacing.xl,
    justifyContent: 'space-between',
  },
  topSection: {
    alignItems: 'center',
  },
  avatarBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  welcomeText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  instructionText: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 6,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.surfaceHighlight,
    borderWidth: 1.5,
    borderColor: Colors.borderDark,
  },
  dotFilled: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  hintText: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  keypad: {
    paddingHorizontal: Spacing.md,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
  },
  keyBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    ...Shadows.subtle,
  },
  keyText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  actionKeyBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    alignItems: 'center',
  },
  forgotPinText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
});
