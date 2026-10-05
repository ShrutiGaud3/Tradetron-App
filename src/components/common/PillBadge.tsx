import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Defs, Pattern, Line, LinearGradient, Stop } from 'react-native-svg';
import { Colors, BorderRadius, Shadows } from '../../theme';

interface PillBadgeProps {
  label: string;
  value: string;
  variant: 'coral' | 'amber' | 'blue' | 'green';
}

export const PillBadge: React.FC<PillBadgeProps> = ({ label, value, variant }) => {
  const getColors = () => {
    switch (variant) {
      case 'coral':
        return { 
          grad: ['#FA5A5A', '#E11D48'], 
          border: 'rgba(250, 90, 90, 0.4)', 
          line: '#FFFFFF',
          textColor: '#DC2626'
        };
      case 'amber':
        return { 
          grad: ['#FBBF24', '#D97706'], 
          border: 'rgba(251, 191, 36, 0.4)', 
          line: '#FFFFFF',
          textColor: '#D97706'
        };
      case 'blue':
        return { 
          grad: ['#3B82F6', '#1D4ED8'], 
          border: 'rgba(59, 130, 246, 0.4)', 
          line: '#FFFFFF',
          textColor: '#2563EB'
        };
      case 'green':
        return { 
          grad: ['#10B981', '#059669'], 
          border: 'rgba(16, 185, 129, 0.4)', 
          line: '#FFFFFF',
          textColor: '#059669'
        };
    }
  };

  const { grad, border, line, textColor } = getColors();

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label} numberOfLines={1}>
        {label} <Text style={[styles.valueHighlight, { color: textColor }]}>{value}</Text>
      </Text>

      <View style={[styles.pillContainer, { borderColor: border }]}>
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id={`grad-${variant}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={grad[0]} stopOpacity="0.95" />
              <Stop offset="100%" stopColor={grad[1]} stopOpacity="1" />
            </LinearGradient>

            <Pattern id={`pat-${variant}`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <Line x1="0" y1="0" x2="0" y2="5" stroke={line} strokeWidth="1.2" strokeOpacity="0.32" />
            </Pattern>
          </Defs>

          {/* Base Gradient */}
          <Rect width="100%" height="100%" fill={`url(#grad-${variant})`} rx={10} />
          {/* Textured Overlay */}
          <Rect width="100%" height="100%" fill={`url(#pat-${variant})`} rx={10} />
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    marginHorizontal: 3,
  },
  label: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 3,
  },
  valueHighlight: {
    fontWeight: '800',
    fontSize: 9.5,
  },
  pillContainer: {
    height: 18,
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
    borderWidth: 1,
    ...Shadows.subtle,
  },
});
