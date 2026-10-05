import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Shadows } from '../../theme';

export const AiAssistantCard: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [activeModel, setActiveModel] = useState<'Financial AI' | 'Candle analyst' | 'GPT-4o'>('Financial AI');

  return (
    <View style={styles.outerWrapper}>
      <LinearGradient
        colors={[
          'rgba(205, 228, 255, 0.72)', 
          'rgba(170, 210, 255, 0.52)', 
          'rgba(215, 238, 255, 0.68)'
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View style={styles.titleWithIcon}>
            <LinearGradient
              colors={['#2563EB', '#60A5FA']}
              style={styles.sparkleBadge}
            >
              <MaterialCommunityIcons name="star-four-points" size={14} color="#FFFFFF" />
            </LinearGradient>
            <View>
              <Text style={styles.headerTitle}>Algo AI Copilot</Text>
              <Text style={styles.headerSub}>Live Quantitative Strategy Advisor</Text>
            </View>
          </View>

          <View style={styles.headerControls}>
            <TouchableOpacity style={styles.iconBtn}>
              <Feather name="file-text" size={13} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Feather name="arrow-up-right" size={13} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Suggested Chat Bubble */}
        <View style={styles.chatBubble}>
          <Text style={styles.bubbleText}>Where should I deploy algo strategies today?</Text>
        </View>

        {/* AI Recommendation Box with Translucent Blue Tint */}
        <View style={styles.recBox}>
          <View style={styles.recHeader}>
            <MaterialCommunityIcons name="star-four-points-outline" size={13} color={Colors.accentAmber} />
            <Text style={styles.recTitle}>Strategy Signal Focus:</Text>
          </View>
          <Text style={styles.recItem}>• High India VIX: Recommend <Text style={styles.highlightText}>NIFTY 9:20 Straddle Pro</Text> (Theta Decay)</Text>
          <Text style={styles.recItem}>• Caution: Avoid naked OTM Buying due to rapid IV collapse</Text>
        </View>

        {/* Model Filter Pills with Blue Glow Toggles */}
        <View style={styles.modelPills}>
          {(['Financial AI', 'Candle analyst', 'GPT-4o'] as const).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.modelBtn, activeModel === m && styles.modelBtnActive]}
              onPress={() => setActiveModel(m)}
            >
              <Text style={[styles.modelBtnText, activeModel === m && styles.modelBtnTextActive]}>
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Input Action Bar with Frosted Glass Look */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.plusBtn}>
            <Feather name="plus" size={15} color={Colors.primary} />
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            placeholder="Ask AI Copilot for trade insights..."
            placeholderTextColor={Colors.textTertiary}
            value={prompt}
            onChangeText={setPrompt}
          />

          <TouchableOpacity style={styles.micBtn}>
            <Feather name="mic" size={14} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.sendBtn} activeOpacity={0.8}>
            <Feather name="send" size={12} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(37, 99, 235, 0.35)',
    overflow: 'hidden',
    backgroundColor: 'rgba(195, 222, 255, 0.35)',
    ...Shadows.glassCard,
  },
  gradientContainer: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    padding: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sparkleBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.blueGlow,
  },
  headerTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerSub: {
    fontSize: 9.5,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  headerControls: {
    flexDirection: 'row',
    gap: 6,
  },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.25)',
  },
  chatBubble: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 12,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.25)',
  },
  bubbleText: {
    fontSize: 10.5,
    color: Colors.primary,
    fontWeight: '700',
  },
  recBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 12,
    padding: 8,
    marginTop: 5,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.22)',
  },
  recHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  recTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  recItem: {
    fontSize: 10.5,
    color: Colors.textSecondary,
    lineHeight: 15,
    marginVertical: 1,
  },
  highlightText: {
    fontWeight: '800',
    color: Colors.primary,
  },
  modelPills: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 8,
  },
  modelBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.22)',
  },
  modelBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  modelBtnText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  modelBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: BorderRadius.round,
    paddingHorizontal: 6,
    paddingVertical: 3.5,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.25)',
  },
  plusBtn: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 10.5,
    color: Colors.textPrimary,
    paddingHorizontal: 6,
  },
  micBtn: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.button,
  },
});
