import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import {useColors} from '../../contexts/ThemeContext';
import {spacing, fonts} from '../../utilities/theme';
import Text from '../ui/Text';
import Svg, {Path} from 'react-native-svg';

// =============================================================================
// ICONS
// =============================================================================

const PlusIcon = ({color, size = 24}: {color: string; size?: number}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5v14M5 12h14"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </Svg>
);

const MinusIcon = ({color, size = 24}: {color: string; size?: number}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 12h14"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </Svg>
);

const EditIcon = ({color, size = 16}: {color: string; size?: number}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// =============================================================================
// ANIMATED BUTTON
// =============================================================================

interface AnimatedButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  style?: any;
  disabled?: boolean;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  onPress,
  children,
  style,
  disabled,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, {damping: 15});
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {damping: 15});
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}>
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
};

// =============================================================================
// RATING INPUT COMPONENT
// =============================================================================

interface RatingInputProps {
  currentRating?: number | null;
  duprId?: string | null;
  onSave: (rating: number, duprId?: string) => void;
  loading?: boolean;
}

const RatingInput: React.FC<RatingInputProps> = ({
  currentRating,
  duprId: initialDuprId,
  onSave,
  loading = false,
}) => {
  const colors = useColors();
  const [modalVisible, setModalVisible] = useState(false);
  const [rating, setRating] = useState(currentRating || 3.0);
  const [duprId, setDuprId] = useState(initialDuprId || '');

  const openModal = useCallback(() => {
    setRating(currentRating || 3.0);
    setDuprId(initialDuprId || '');
    setModalVisible(true);
  }, [currentRating, initialDuprId]);

  const closeModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const incrementRating = useCallback(() => {
    setRating(prev => Math.min(8.0, Math.round((prev + 0.25) * 100) / 100));
  }, []);

  const decrementRating = useCallback(() => {
    setRating(prev => Math.max(1.0, Math.round((prev - 0.25) * 100) / 100));
  }, []);

  const handleSave = useCallback(() => {
    onSave(rating, duprId || undefined);
    closeModal();
  }, [rating, duprId, onSave, closeModal]);

  const formatRating = (value: number): string => {
    return value.toFixed(2);
  };

  return (
    <>
      {/* Display Card */}
      <TouchableOpacity
        onPress={openModal}
        activeOpacity={0.7}
        style={[styles.card, {backgroundColor: colors.surface}]}>
        <View style={styles.cardContent}>
          <View style={styles.cardLeft}>
            <Text variant="caption" color="tertiary" style={styles.cardLabel}>
              Pickleball Rating
            </Text>
            {currentRating ? (
              <View style={styles.ratingDisplay}>
                <Text variant="h2" style={styles.ratingValue}>
                  {formatRating(currentRating)}
                </Text>
                <View
                  style={[styles.duprBadge, {backgroundColor: colors.accent + '20'}]}>
                  <Text
                    variant="caption"
                    style={{color: colors.accent, fontWeight: '600'}}>
                    DUPR
                  </Text>
                </View>
              </View>
            ) : (
              <Text variant="body" color="secondary">
                Tap to add your rating
              </Text>
            )}
          </View>
          <View
            style={[styles.editButton, {backgroundColor: colors.surfaceLight}]}>
            <EditIcon color={colors.text.secondary} size={18} />
          </View>
        </View>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}>
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <Pressable
            style={[styles.modalContent, {backgroundColor: colors.surface}]}
            onPress={e => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text variant="h3" style={{fontWeight: '700'}}>
                Set DUPR Rating
              </Text>
              <Text variant="caption" color="tertiary" style={styles.modalSubtitle}>
                Enter your official DUPR rating
              </Text>
            </View>

            {/* Rating Selector */}
            <View style={styles.ratingSelector}>
              <AnimatedButton
                onPress={decrementRating}
                disabled={rating <= 1.0}
                style={[
                  styles.ratingButton,
                  {
                    backgroundColor:
                      rating <= 1.0 ? colors.border : colors.surfaceLight,
                  },
                ]}>
                <MinusIcon
                  color={rating <= 1.0 ? colors.text.tertiary : colors.text.primary}
                  size={28}
                />
              </AnimatedButton>

              <View style={styles.ratingValueContainer}>
                <Text style={[styles.ratingText, {color: colors.accent}]}>
                  {formatRating(rating)}
                </Text>
              </View>

              <AnimatedButton
                onPress={incrementRating}
                disabled={rating >= 8.0}
                style={[
                  styles.ratingButton,
                  {
                    backgroundColor:
                      rating >= 8.0 ? colors.border : colors.surfaceLight,
                  },
                ]}>
                <PlusIcon
                  color={rating >= 8.0 ? colors.text.tertiary : colors.text.primary}
                  size={28}
                />
              </AnimatedButton>
            </View>

            {/* Quick Select */}
            <View style={styles.quickSelect}>
              {[2.5, 3.0, 3.5, 4.0, 4.5, 5.0].map(value => (
                <TouchableOpacity
                  key={value}
                  onPress={() => setRating(value)}
                  style={[
                    styles.quickSelectButton,
                    {
                      backgroundColor:
                        Math.abs(rating - value) < 0.01
                          ? colors.accent
                          : colors.surfaceLight,
                    },
                  ]}>
                  <Text
                    variant="caption"
                    style={{
                      color:
                        Math.abs(rating - value) < 0.01
                          ? colors.background
                          : colors.text.secondary,
                      fontWeight: '600',
                    }}>
                    {value.toFixed(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* DUPR ID Input (Optional) */}
            <View style={styles.duprIdSection}>
              <Text variant="caption" color="tertiary" style={styles.optionalLabel}>
                DUPR ID (Optional)
              </Text>
              <TextInput
                style={[
                  styles.duprIdInput,
                  {
                    backgroundColor: colors.surfaceLight,
                    color: colors.text.primary,
                    borderColor: colors.border,
                  },
                ]}
                value={duprId}
                onChangeText={setDuprId}
                placeholder="e.g., 12345678"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="number-pad"
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={loading}
              style={[
                styles.saveButton,
                {backgroundColor: loading ? colors.border : colors.accent},
              ]}>
              <Text
                variant="body"
                style={{color: colors.background, fontWeight: '600'}}>
                {loading ? 'Saving...' : 'Save Rating'}
              </Text>
            </TouchableOpacity>

            {/* Cancel */}
            <TouchableOpacity onPress={closeModal} style={styles.cancelButton}>
              <Text variant="body" color="secondary">
                Cancel
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: spacing.md,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flex: 1,
  },
  cardLabel: {
    marginBottom: 4,
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ratingValue: {
    fontWeight: '700',
  },
  duprBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    padding: spacing.lg,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalSubtitle: {
    marginTop: 4,
  },
  ratingSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  ratingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingValueContainer: {
    minWidth: 100,
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 48,
    fontFamily: fonts.ReadexBold,
    fontWeight: '700',
  },
  quickSelect: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  quickSelectButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  duprIdSection: {
    marginBottom: spacing.lg,
  },
  optionalLabel: {
    marginBottom: spacing.xs,
  },
  duprIdInput: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    fontFamily: fonts.ReadexRegular,
    borderWidth: 1,
  },
  saveButton: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  cancelButton: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RatingInput;
