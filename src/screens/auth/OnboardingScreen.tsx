import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  ScrollView 
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../../theme';

interface OnboardingScreenProps {
  onComplete: () => void;
  onLoginPress: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    icon: 'code-braces' as const,
    badge: 'Zero Code Required',
    badgeColor: Colors.primaryLight,
    badgeTextColor: Colors.primary,
    title: 'Build Powerful Algos Without Writing Code',
    description: 'Combine indicators like RSI, Supertrend, EMA, and VWAP with multi-leg options logic (ATM/OTM strikes, CE/PE) effortlessly.',
  },
  {
    id: '2',
    icon: 'shield-check-outline' as const,
    badge: 'Risk-Free Simulation',
    badgeColor: Colors.accentPurpleLight,
    badgeTextColor: Colors.accentPurple,
    title: 'Paper Trade Before Risking Real Capital',
    description: 'Test your strategies with live real-time market data in paper trading mode. Fine-tune your risk rules with zero financial exposure.',
  },
  {
    id: '3',
    icon: 'lightning-bolt' as const,
    badge: 'Multi-Broker Live Trading',
    badgeColor: Colors.accentGreenLight,
    badgeTextColor: Colors.accentGreen,
    title: 'Automated Fills with Upstox, Zerodha & More',
    description: 'Connect your broker API seamlessly. Orders are verified by pre-trade risk checks and routed in sub-milliseconds with kill-switch protection.',
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ 
  onComplete, 
  onLoginPress 
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const slide = slides[currentSlide];

  return (
    <View style={styles.container}>
      {/* Top Header & Skip */}
      <View style={styles.headerRow}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <MaterialCommunityIcons name="lightning-bolt" size={16} color="#FFFFFF" />
          </View>
          <Text style={styles.brandName}>Tradetron<Text style={styles.brandSub}>.AI</Text></Text>
        </View>

        <TouchableOpacity onPress={onComplete}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Main Slide Card */}
      <View style={styles.slideContent}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name={slide.icon} size={48} color={Colors.primary} />
        </View>

        <View style={[styles.badge, { backgroundColor: slide.badgeColor }]}>
          <Text style={[styles.badgeText, { color: slide.badgeTextColor }]}>
            {slide.badge}
          </Text>
        </View>

        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>

        {/* Slide Pagination Dots */}
        <View style={styles.dotsRow}>
          {slides.map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.dot, 
                currentSlide === i ? styles.dotActive : styles.dotInactive
              ]} 
            />
          ))}
        </View>
      </View>

      {/* Risk Disclosure Snippet */}
      <View style={styles.disclosureBox}>
        <MaterialCommunityIcons name="information-outline" size={14} color={Colors.textTertiary} />
        <Text style={styles.disclosureText}>
          Algorithmic trading involves market risk. Backtested returns do not guarantee future performance.
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.footerActions}>
        <TouchableOpacity 
          style={styles.primaryBtn} 
          activeOpacity={0.8}
          onPress={handleNext}
        >
          <Text style={styles.primaryBtnText}>
            {currentSlide === slides.length - 1 ? 'Get Started' : 'Continue'}
          </Text>
          <Feather name="arrow-right" size={16} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginBtn}
          onPress={onLoginPress}
        >
          <Text style={styles.loginBtnText}>
            Already have an account? <Text style={styles.loginHighlight}>Log In</Text>
          </Text>
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
    paddingTop: Spacing.xxxl,
    paddingBottom: Spacing.xl,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  brandSub: {
    color: Colors.primary,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  slideContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.round,
    marginBottom: Spacing.md,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 30,
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: Spacing.xl,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 22,
    backgroundColor: Colors.primary,
  },
  dotInactive: {
    width: 6,
    backgroundColor: Colors.borderDark,
  },
  disclosureBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(241, 245, 249, 0.7)',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  disclosureText: {
    flex: 1,
    fontSize: 10,
    color: Colors.textTertiary,
    lineHeight: 14,
  },
  footerActions: {
    gap: 12,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.round,
    paddingVertical: 14,
    ...Shadows.button,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loginBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  loginBtnText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  loginHighlight: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
