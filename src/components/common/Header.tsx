import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Shadows } from '../../theme';
import { useAppStore } from '../../store/useAppStore';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showAvatar?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  title = 'Tradetron', 
  subtitle = 'My Portfolio',
  showAvatar = true 
}) => {
  const insets = useSafeAreaInsets();
  const user = useAppStore((state) => state.user);
  const isKillSwitchActive = useAppStore((state) => state.isKillSwitchActive);
  const toggleKillSwitch = useAppStore((state) => state.toggleKillSwitch);
  const setProfileOpen = useAppStore((state) => state.setProfileOpen);

  const notifications = useAppStore((state) => state.notifications);
  const setNotificationsOpen = useAppStore((state) => state.setNotificationsOpen);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const dynamicPaddingTop = insets.top > 0 ? insets.top + 4 : (Platform.OS === 'ios' ? 44 : 10);

  return (
    <View style={[styles.container, { paddingTop: dynamicPaddingTop }]}>
      {/* Brand & Action Buttons */}
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <LinearGradient
            colors={['#2563EB', '#1D4ED8']}
            style={styles.logoBadge}
          >
            <MaterialCommunityIcons name="lightning-bolt" size={16} color="#FFFFFF" />
          </LinearGradient>
          <View>
            <Text style={styles.brandName}>Tradetron<Text style={styles.brandSub}>.AI</Text></Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          {/* Notification Bell with Badge */}
          <TouchableOpacity 
            style={styles.notifHeaderBtn} 
            onPress={() => setNotificationsOpen(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={15} color={Colors.primary} />
            {unreadCount > 0 && <View style={styles.headerBadgeDot} />}
          </TouchableOpacity>

          {/* Panic / Kill Switch button */}
          <TouchableOpacity 
            style={[styles.killSwitchBtn, isKillSwitchActive && styles.killSwitchActive]} 
            onPress={toggleKillSwitch}
            activeOpacity={0.8}
          >
            <Ionicons 
              name="power" 
              size={15} 
              color={isKillSwitchActive ? '#FFFFFF' : Colors.accentCoral} 
            />
          </TouchableOpacity>

          {/* User Profile Avatar with Blue Glow Border */}
          {showAvatar && (
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={() => setProfileOpen(true)}
              activeOpacity={0.8}
            >
              <Image 
                source={{ uri: user.avatarUrl }} 
                style={styles.avatar} 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Screen Title & Breadcrumb */}
      {subtitle && (
        <View style={styles.titleRow}>
          <View style={styles.titleLeft}>
            <View style={styles.livePulseDot} />
            <Text style={styles.subtitleText}>{title} / <Text style={styles.titleHighlight}>{subtitle}</Text></Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(37, 99, 235, 0.15)',
    elevation: 4,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    zIndex: 100,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.blueGlow,
  },
  brandName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  brandSub: {
    color: Colors.primary,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notifHeaderBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(37, 99, 235, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.22)',
    position: 'relative',
  },
  headerBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accentCoral,
    position: 'absolute',
    top: 5,
    right: 5,
  },
  killSwitchBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.accentCoralLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(250, 90, 90, 0.25)',
  },
  killSwitchActive: {
    backgroundColor: Colors.accentCoral,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.borderGlassGlow,
    ...Shadows.subtle,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  titleRow: {
    marginTop: 4,
    marginBottom: 1,
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accentGreen,
  },
  subtitleText: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  titleHighlight: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
});
