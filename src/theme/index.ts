export const Colors = {
  // Primary Royal Brand & Variants
  primary: '#2563EB', // Electric Royal Blue
  primaryDark: '#1D4ED8',
  primaryDeep: '#1E3A8A',
  primaryLight: 'rgba(37, 99, 235, 0.12)',
  primaryGlow: '#60A5FA',
  
  // Rich Transparent Blue Tints (Glassmorphism & Glows)
  blueTint3: 'rgba(37, 99, 235, 0.05)',
  blueTint6: 'rgba(37, 99, 235, 0.10)',
  blueTint10: 'rgba(37, 99, 235, 0.16)',
  blueTint15: 'rgba(37, 99, 235, 0.22)',
  blueTint25: 'rgba(37, 99, 235, 0.32)',
  blueTint40: 'rgba(37, 99, 235, 0.45)',
  
  // Sky / Cyan Accents
  secondary: '#0284C7',
  secondaryLight: 'rgba(2, 132, 199, 0.15)',
  cyanTint: 'rgba(6, 182, 212, 0.16)',
  neonCyan: '#06B6D4',
  
  // Trading Action Colors & Tints
  accentCoral: '#FA5A5A', // Loss / Sell
  accentCoralLight: 'rgba(250, 90, 90, 0.15)',
  coralTint: 'rgba(250, 90, 90, 0.18)',
  
  // Warning / Pending
  accentAmber: '#F59E0B', 
  accentAmberLight: 'rgba(245, 158, 11, 0.16)',
  amberTint: 'rgba(245, 158, 11, 0.18)',
  
  // Profit / Buy
  accentGreen: '#10B981', 
  accentGreenLight: 'rgba(16, 185, 129, 0.16)',
  greenTint: 'rgba(16, 185, 129, 0.18)',
  
  // Purple / Paper
  accentPurple: '#8B5CF6',
  accentPurpleLight: 'rgba(139, 92, 246, 0.16)',
  purpleTint: 'rgba(139, 92, 246, 0.18)',
  
  // Backgrounds with Richer Ambient Blue Glow
  background: '#E2ECF7',
  backgroundGradientStart: '#D8E7F7',
  backgroundGradientEnd: '#EBF3FC',
  
  // Frosted Transparent Blue Surfaces
  surface: 'rgba(215, 233, 255, 0.65)',
  surfaceGlass: 'rgba(205, 228, 255, 0.60)',
  surfaceGlassSubtle: 'rgba(215, 235, 255, 0.45)',
  surfaceHighlight: 'rgba(190, 220, 255, 0.50)',
  surfaceTinted: 'rgba(180, 215, 255, 0.55)',
  
  // Borders & Glass Outlines with Deep Blue Accent
  border: 'rgba(37, 99, 235, 0.22)',
  borderGlass: 'rgba(37, 99, 235, 0.32)',
  borderGlassGlow: 'rgba(37, 99, 235, 0.55)',
  borderLight: 'rgba(37, 99, 235, 0.15)',
  borderDark: '#94A3B8',

  // Typography
  textPrimary: '#0F172A',
  textSecondary: '#334155',
  textTertiary: '#64748B',
  textWhite: '#FFFFFF',
  textBlueHighlight: '#1D4ED8',
};

export const Shadows = {
  card: {
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 3,
  },
  glassCard: {
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 4,
  },
  cardHover: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
    elevation: 6,
  },
  button: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  subtle: {
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 1,
  },
  blueGlow: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 5,
  }
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BorderRadius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 24,
  round: 9999,
};
