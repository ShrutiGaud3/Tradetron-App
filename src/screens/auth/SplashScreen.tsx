import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../../theme';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [scaleAnim] = useState(() => new Animated.Value(0.8));
  const [opacityAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      onFinish();
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.logoContainer, 
          { 
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }] 
          }
        ]}
      >
        <View style={styles.logoBadge}>
          <MaterialCommunityIcons name="lightning-bolt" size={42} color="#FFFFFF" />
        </View>

        <Text style={styles.brandTitle}>Tradetron<Text style={styles.brandAccent}>.AI</Text></Text>
        <Text style={styles.tagline}>Institutional No-Code Algo Trading</Text>

        <View style={styles.securityTag}>
          <MaterialCommunityIcons name="shield-check" size={14} color={Colors.accentGreen} />
          <Text style={styles.securityText}>SEBI Compliant Broker Architecture</Text>
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.versionText}>v1.0.0 (Developer Build)</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadows.cardHover,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  brandAccent: {
    color: Colors.primary,
  },
  tagline: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 6,
  },
  securityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.accentGreenLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
    marginTop: Spacing.xl,
  },
  securityText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accentGreen,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
  },
  versionText: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: '600',
  },
});
