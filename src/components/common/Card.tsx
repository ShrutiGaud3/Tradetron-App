import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Shadows, BorderRadius, Spacing } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: keyof typeof Spacing;
  highlighted?: boolean;
  variant?: 'glass' | 'white' | 'tinted' | 'blueGlass';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  style, 
  padding,
  highlighted = false,
  variant = 'blueGlass'
}) => {
  const flatStyle = StyleSheet.flatten(style) || {};
  
  // Extract border radius so both outer and inner gradient are perfectly rounded
  const radius = flatStyle.borderRadius !== undefined ? flatStyle.borderRadius : BorderRadius.xl;

  // Outer wrapper styles (layout, positioning, shadows, margins)
  const {
    padding: _p,
    paddingHorizontal: _ph,
    paddingVertical: _pv,
    paddingTop: _pt,
    paddingBottom: _pb,
    paddingLeft: _pl,
    paddingRight: _pr,
    gap: _gap,
    borderRadius: _br,
    borderTopLeftRadius: _btlr,
    borderTopRightRadius: _btrr,
    borderBottomLeftRadius: _bblr,
    borderBottomRightRadius: _bbrr,
    ...wrapperStyleRest
  } = flatStyle;

  // Inner gradient styles (padding & content spacing)
  const defaultPadding = padding ? Spacing[padding] : (_p !== undefined ? _p : Spacing.md);
  const innerPaddingStyle = {
    padding: _p !== undefined ? _p : defaultPadding,
    paddingHorizontal: _ph,
    paddingVertical: _pv,
    paddingTop: _pt,
    paddingBottom: _pb,
    paddingLeft: _pl,
    paddingRight: _pr,
    gap: _gap,
  };

  return (
    <View 
      style={[
        styles.blueGlassWrapper,
        { borderRadius: radius },
        highlighted && styles.highlightedBlueGlass,
        wrapperStyleRest,
      ]}
    >
      <LinearGradient
        colors={[
          'rgba(210, 232, 255, 0.72)', 
          'rgba(180, 215, 255, 0.55)', 
          'rgba(220, 240, 255, 0.68)'
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradientCard, 
          { borderRadius: radius },
          innerPaddingStyle
        ]}
      >
        {children}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  blueGlassWrapper: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(37, 99, 235, 0.35)',
    overflow: 'hidden',
    backgroundColor: 'rgba(195, 222, 255, 0.35)',
    ...Shadows.glassCard,
  },
  highlightedBlueGlass: {
    borderColor: 'rgba(37, 99, 235, 0.60)',
    ...Shadows.cardHover,
  },
  gradientCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
});
