import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Alert 
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../../theme';

import { apiLogin } from '../../services/apiClient';

interface LoginScreenProps {
  onSendOtp: (identifier: string) => void;
  onBiometricLogin: () => void;
  onDirectLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ 
  onSendOtp, 
  onBiometricLogin,
  onDirectLogin,
}) => {
  const [authMethod, setAuthMethod] = useState<'mobile' | 'email'>('email');
  const [mobileNumber, setMobileNumber] = useState('9876543210');
  const [email, setEmail] = useState('trader@platform.com');
  const [password, setPassword] = useState('TraderPassword@123');
  const [showPassword, setShowPassword] = useState(false);
  const [useOtpLogin, setUseOtpLogin] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (authMethod === 'mobile') {
      if (mobileNumber.length < 10) {
        Alert.alert('Validation', 'Please enter a valid 10-digit mobile number');
        return;
      }
      onSendOtp(mobileNumber);
    } else {
      if (!email.includes('@')) {
        Alert.alert('Validation', 'Please enter a valid email address');
        return;
      }
      if (useOtpLogin) {
        onSendOtp(email);
      } else {
        setLoading(true);
        try {
          await apiLogin(email.trim(), password);
          setLoading(false);
          onDirectLogin();
        } catch (err: any) {
          setLoading(false);
          Alert.alert('Authentication Failed', err.message || 'Invalid email or password');
        }
      }
    }
  };

  return (
    <ScrollView 
      style={styles.screen} 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Brand Header */}
      <View style={styles.header}>
        <View style={styles.logoBadge}>
          <MaterialCommunityIcons name="lightning-bolt" size={24} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>Welcome to Tradetron</Text>
        <Text style={styles.subtitle}>Enter your details to access your algo trading console</Text>
      </View>

      {/* Auth Method Selector (Mobile vs Email) */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabBtn, authMethod === 'mobile' && styles.tabBtnActive]}
          onPress={() => setAuthMethod('mobile')}
        >
          <MaterialCommunityIcons 
            name="cellphone" 
            size={16} 
            color={authMethod === 'mobile' ? Colors.primary : Colors.textTertiary} 
          />
          <Text style={[styles.tabText, authMethod === 'mobile' && styles.tabTextActive]}>
            Mobile OTP
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabBtn, authMethod === 'email' && styles.tabBtnActive]}
          onPress={() => setAuthMethod('email')}
        >
          <MaterialCommunityIcons 
            name="email-outline" 
            size={16} 
            color={authMethod === 'email' ? Colors.primary : Colors.textTertiary} 
          />
          <Text style={[styles.tabText, authMethod === 'email' && styles.tabTextActive]}>
            Email Login
          </Text>
        </TouchableOpacity>
      </View>

      {/* Inputs Form */}
      <View style={styles.form}>
        {authMethod === 'mobile' ? (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mobile Number</Text>
            <View style={styles.mobileInputRow}>
              <View style={styles.countryCodeBadge}>
                <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
              </View>
              <TextInput
                style={styles.mobileInput}
                placeholder="Enter 10-digit mobile number"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="phone-pad"
                maxLength={10}
                value={mobileNumber}
                onChangeText={setMobileNumber}
              />
            </View>
          </View>
        ) : (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Work / Trading Email</Text>
              <View style={styles.inputContainer}>
                <Feather name="mail" size={16} color={Colors.textTertiary} />
                <TextInput
                  style={styles.textInput}
                  placeholder="name@example.com"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {!useOtpLogin && (
              <View style={styles.inputGroup}>
                <View style={styles.passwordHeader}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <TouchableOpacity>
                    <Text style={styles.forgotText}>Forgot?</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.inputContainer}>
                  <Feather name="lock" size={16} color={Colors.textTertiary} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your password"
                    placeholderTextColor={Colors.textTertiary}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Feather name={showPassword ? 'eye-off' : 'eye'} size={16} color={Colors.textTertiary} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* OTP or Password toggle */}
            <TouchableOpacity 
              style={styles.toggleLoginType}
              onPress={() => setUseOtpLogin(!useOtpLogin)}
            >
              <Text style={styles.toggleLoginText}>
                {useOtpLogin ? 'Login using Password instead' : 'Login via One-Time Password (OTP)'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Submit Button */}
        <TouchableOpacity 
          style={styles.submitBtn} 
          activeOpacity={0.8}
          onPress={handleSubmit}
        >
          <Text style={styles.submitBtnText}>
            {authMethod === 'mobile' || useOtpLogin ? 'Get Instant OTP' : 'Sign In'}
          </Text>
          <Feather name="arrow-right" size={16} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Biometric Quick Login Button */}
        <TouchableOpacity 
          style={styles.biometricBtn} 
          activeOpacity={0.8}
          onPress={onBiometricLogin}
        >
          <MaterialCommunityIcons name="fingerprint" size={20} color={Colors.primary} />
          <Text style={styles.biometricText}>Quick Sign-in with Biometrics / PIN</Text>
        </TouchableOpacity>
      </View>

      {/* Security Compliance Note */}
      <View style={styles.footerNote}>
        <MaterialCommunityIcons name="lock-check" size={14} color={Colors.accentGreen} />
        <Text style={styles.footerText}>
          Secured with 256-bit encryption & 2FA. We never store broker master passwords.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxxl,
    paddingBottom: Spacing.xxl,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadows.subtle,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: BorderRadius.round,
    padding: 3,
    marginBottom: Spacing.xl,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: BorderRadius.round,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    ...Shadows.subtle,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  form: {
    backgroundColor: '#FFFFFF',
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    ...Shadows.card,
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  mobileInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  countryCodeBadge: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  countryCodeText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  mobileInput: {
    flex: 1,
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  forgotText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  toggleLoginType: {
    marginBottom: Spacing.md,
  },
  toggleLoginText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.round,
    paddingVertical: 14,
    ...Shadows.button,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.round,
    paddingVertical: 12,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.2)',
  },
  biometricText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm,
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 10,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 14,
  },
});
