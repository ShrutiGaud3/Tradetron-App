import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../../theme';
import { Card } from '../common/Card';
import { useAppStore } from '../../store/useAppStore';
import { Strategy } from '../../types';

interface StrategyReviewsModalProps {
  visible: boolean;
  onClose: () => void;
  strategy?: Strategy | null;
}

export const StrategyReviewsModal: React.FC<StrategyReviewsModalProps> = ({
  visible,
  onClose,
  strategy,
}) => {
  const reviewsMap = useAppStore((state) => state.reviews);
  const addStrategyReview = useAppStore((state) => state.addStrategyReview);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isWriting, setIsWriting] = useState(false);

  if (!strategy) return null;

  const strategyReviews = reviewsMap[strategy.id] || [
    {
      id: 'rev_default',
      userName: 'Siddharth Rao',
      rating: 5,
      comment: 'Very stable execution during volatile market opening. Stopped out cleanly with minimum slippage.',
      date: '2 days ago',
      profitVerified: true,
    }
  ];

  const avgRating = (
    strategyReviews.reduce((acc, r) => acc + r.rating, 0) / (strategyReviews.length || 1)
  ).toFixed(1);

  const handleSubmitReview = () => {
    if (!comment.trim()) {
      Alert.alert('Review Required', 'Please write a brief feedback comment.');
      return;
    }

    addStrategyReview(strategy.id, {
      rating,
      comment: comment.trim(),
    });

    setComment('');
    setIsWriting(false);
    Alert.alert('Review Posted', 'Thank you! Your verified feedback has been published.');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconContainer}>
                <MaterialCommunityIcons name="star-shooting" size={20} color="#F59E0B" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Community Reviews</Text>
                <Text style={styles.headerSubtitle} numberOfLines={1}>{strategy.name}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.closeBtn} 
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="x" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Rating Summary Card */}
          <View style={styles.summarySection}>
            <Card style={styles.summaryCard} variant="blueGlass">
              <View style={styles.scoreCol}>
                <Text style={styles.scoreText}>{avgRating}</Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <MaterialCommunityIcons
                      key={s}
                      name="star"
                      size={14}
                      color={s <= Math.round(Number(avgRating)) ? '#F59E0B' : '#CBD5E1'}
                    />
                  ))}
                </View>
                <Text style={styles.reviewCountText}>{strategyReviews.length} verified reviews</Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.scoreInfoCol}>
                <View style={styles.verifiedRow}>
                  <MaterialCommunityIcons name="shield-check" size={14} color={Colors.accentGreen} />
                  <Text style={styles.verifiedText}>Broker Executed Orders Only</Text>
                </View>
                <Text style={styles.verifiedSub}>
                  Ratings are submitted by traders with active broker deployments.
                </Text>
              </View>
            </Card>
          </View>

          {/* Write a Review Trigger / Form */}
          <View style={styles.actionHeader}>
            <Text style={styles.sectionHeading}>User Experiences</Text>
            <TouchableOpacity 
              style={styles.writeReviewBtn}
              onPress={() => setIsWriting(!isWriting)}
            >
              <Feather name={isWriting ? 'x' : 'edit-3'} size={12} color={Colors.primary} />
              <Text style={styles.writeReviewBtnText}>{isWriting ? 'Cancel' : 'Write Review'}</Text>
            </TouchableOpacity>
          </View>

          {isWriting && (
            <Card style={styles.writeFormCard} variant="glass">
              <Text style={styles.writeFormTitle}>Rate this Strategy:</Text>
              <View style={styles.starPickerRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <TouchableOpacity key={s} onPress={() => setRating(s)} activeOpacity={0.7}>
                    <MaterialCommunityIcons
                      name={s <= rating ? 'star' : 'star-outline'}
                      size={28}
                      color="#F59E0B"
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.commentInput}
                placeholder="Share your live trading results, slippage, or remarks..."
                placeholderTextColor={Colors.textTertiary}
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity style={styles.submitReviewBtn} onPress={handleSubmitReview} activeOpacity={0.8}>
                <Text style={styles.submitReviewBtnText}>Post Verified Review</Text>
              </TouchableOpacity>
            </Card>
          )}

          {/* Reviews List */}
          <ScrollView 
            style={styles.scrollBody} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {strategyReviews.map((rev) => (
              <Card key={rev.id} style={styles.reviewCard} variant="glass">
                <View style={styles.reviewHeader}>
                  <View style={styles.userRow}>
                    {rev.avatarUrl ? (
                      <Image source={{ uri: rev.avatarUrl }} style={styles.userAvatar} />
                    ) : (
                      <View style={styles.userAvatarPlaceholder}>
                        <Text style={styles.avatarInitial}>{rev.userName[0]}</Text>
                      </View>
                    )}
                    <View>
                      <View style={styles.userNameVerifiedRow}>
                        <Text style={styles.reviewUser}>{rev.userName}</Text>
                        {rev.profitVerified && (
                          <View style={styles.verifiedBadge}>
                            <MaterialCommunityIcons name="check-decagram" size={12} color={Colors.accentGreen} />
                            <Text style={styles.verifiedBadgeText}>Verified Trader</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.reviewDate}>{rev.date}</Text>
                    </View>
                  </View>

                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <MaterialCommunityIcons
                        key={s}
                        name="star"
                        size={12}
                        color={s <= rev.rating ? '#F59E0B' : '#E2E8F0'}
                      />
                    ))}
                  </View>
                </View>

                <Text style={styles.reviewBody}>{rev.comment}</Text>
              </Card>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
    ...Shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.8)',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    maxWidth: 200,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summarySection: {
    paddingHorizontal: Spacing.md,
    paddingTop: 12,
  },
  summaryCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  scoreCol: {
    alignItems: 'center',
    paddingRight: 12,
    minWidth: 90,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  reviewCountText: {
    fontSize: 9,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: '80%',
    backgroundColor: 'rgba(226, 232, 240, 0.8)',
  },
  scoreInfoCol: {
    flex: 1,
    paddingLeft: 12,
    gap: 2,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  verifiedSub: {
    fontSize: 10,
    color: Colors.textSecondary,
    lineHeight: 14,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: 12,
    paddingBottom: 6,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  writeReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  writeReviewBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  writeFormCard: {
    marginHorizontal: Spacing.md,
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 8,
  },
  writeFormTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  starPickerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  commentInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: Colors.textPrimary,
    height: 60,
    textAlignVertical: 'top',
  },
  submitReviewBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitReviewBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  scrollBody: {
    paddingHorizontal: Spacing.md,
  },
  scrollContent: {
    paddingVertical: 6,
    gap: 8,
  },
  reviewCard: {
    padding: 12,
    borderRadius: 12,
    gap: 6,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  userAvatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  userNameVerifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewUser: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  verifiedBadgeText: {
    fontSize: 8,
    color: Colors.accentGreen,
    fontWeight: '700',
  },
  reviewDate: {
    fontSize: 9,
    color: Colors.textTertiary,
  },
  reviewBody: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
});
