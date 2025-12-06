import React from 'react';
import {StyleSheet, View, Pressable} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {useColors} from '../../contexts/ThemeContext';
import {spacing, borderRadius} from '../../utilities/theme';
import Text from '../ui/Text';
import * as Haptics from 'expo-haptics';

interface PlanCardProps {
  title: string;
  price: string;
  period: string;
  savings?: string;
  selected: boolean;
  recommended?: boolean;
  onSelect: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PlanCard: React.FC<PlanCardProps> = ({
  title,
  price,
  period,
  savings,
  selected,
  recommended = false,
  onSelect,
}) => {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, {damping: 15, stiffness: 150});
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {damping: 15, stiffness: 150});
  };

  const handlePress = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      // Haptics not available
    }
    onSelect();
  };

  return (
    <AnimatedPressable
      style={[
        styles.card,
        {
          backgroundColor: selected
            ? `${colors.accent}10`
            : colors.surfaceLight,
          borderColor: selected ? colors.accent : 'transparent',
        },
        animatedStyle,
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}>
      {recommended && (
        <View style={[styles.recommendedBadge, {backgroundColor: colors.accent}]}>
          <Text
            variant="caption"
            style={{color: colors.text.inverse, fontWeight: '700'}}>
            Best Value
          </Text>
        </View>
      )}
      <View style={styles.content}>
        <Text variant="bodySmall" color="secondary" style={styles.titleText}>
          {title}
        </Text>
        <View style={styles.priceRow}>
          <Text variant="h2">{price}</Text>
          <Text variant="body" color="secondary" style={styles.period}>
            /{period}
          </Text>
        </View>
        {savings && (
          <Text variant="caption" style={{color: colors.accent, marginTop: 4}}>
            {savings}
          </Text>
        )}
      </View>
      <View
        style={[
          styles.radio,
          {borderColor: selected ? colors.accent : colors.text.tertiary},
        ]}>
        {selected && (
          <View style={[styles.radioInner, {backgroundColor: colors.accent}]} />
        )}
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  recommendedBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderBottomLeftRadius: borderRadius.md,
  },
  content: {
    flex: 1,
  },
  titleText: {
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  period: {
    marginLeft: 2,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default PlanCard;
