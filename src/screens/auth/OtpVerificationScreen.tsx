import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Alert 
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../../theme';

interface OtpVerificationScreenProps {
  identifier: string;
  onVerifySuccess: () => void;
  onBack: () => void;
}

export const OtpVerificationScreen: React.FC<OtpVerificationScreenProps> = ({
  identifier = '+91 98765 43210',
  onVerifySuccess,
  onBack,
}) => {
  const [otp, setOtp] = useState(['4', '4', '2', '1']);
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const fullCode = otp.join('');
    if (fullCode.length < 4) {
      Alert.alert('Incomplete Code', 'Please enter the 4-digit verification code.');
      return;
    }

    onVerifySuccess();
  };

  const handleResend = () => {
    setCountdown(30);
    Alert.alert('OTP Sent', `A new verification code has been dispatched to ${identifier}`);
  };

  return (
    <View style={styles.container}>
      {/* Top Bar with Back Button */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Feather name="arrow-left" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Verification</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Header Icon & Text */}
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="message-lock-outline" size={38} color={Colors.primary} />
        </View>

        <Text style={styles.title}>Enter OTP Code</Text>
        <Text style={styles.subtitle}>
          We have sent a 4-digit verification code to {'\n'}
          <Text style={styles.identifierHighlight}>{identifier}</Text>
        </Text>

        {/* Demo OTP Notice Box */}
        <View style={styles.demoNotice}>
          <MaterialCommunityIcons name="information" size={16} color={Colors.primary} />
          <Text style={styles.demoNoticeText}>Demo Sandbox OTP is prefilled: <Text style={{ fontWeight: '800' }}>4421</Text></Text>
        </View>

        {/* 4 Digit OTP Boxes */}
        <View style={styles.otpRow}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(val) => handleOtpChange(val, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Resend Timer */}
        <View style={styles.resendRow}>
          {countdown > 0 ? (
            <Text style={styles.timerText}>
              Resend code in <Text style={styles.timerCount}>{countdown}s</Text>
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendLink}>Resend OTP Code</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Verify CTA */}
        <TouchableOpacity 
          style={styles.verifyBtn} 
          activeOpacity={0.8}
          onPress={handleVerify}
        >
          <Text style={styles.verifyBtnText}>Verify & Continue</Text>
          <Feather name="check" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.helpText}>Need help logging in? <Text style={styles.supportLink}>Contact Support</Text></Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxxl,
    paddingBottom: Spacing.xl,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.subtle,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    ...Shadows.card,
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
    marginTop: 6,
    lineHeight: 18,
  },
  identifierHighlight: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  demoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.round,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  demoNoticeText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },
  otpRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: Spacing.xl,
  },
  otpBox: {
    width: 54,
    height: 58,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: Colors.border,
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    ...Shadows.subtle,
  },
  otpBoxFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  resendRow: {
    marginBottom: Spacing.xl,
  },
  timerText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  timerCount: {
    fontWeight: '700',
    color: Colors.primary,
  },
  resendLink: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  verifyBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.round,
    paddingVertical: 14,
    ...Shadows.button,
  },
  verifyBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footer: {
    alignItems: 'center',
  },
  helpText: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  supportLink: {
    fontWeight: '700',
    color: Colors.primary,
  },
});
