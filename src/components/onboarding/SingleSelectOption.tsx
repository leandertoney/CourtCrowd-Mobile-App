import React from 'react';
import {StyleSheet, Pressable} from 'react-native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {useColors} from '../../contexts/ThemeContext';
import {spacing, borderRadius} from '../../utilities/theme';
import Text from '../ui/Text';
import * as Haptics from 'expo-haptics';

interface SingleSelectOptionProps {
  label: string;
  value: string;
  selected: boolean;
  onSelect: (value: string) => void;
  index?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SingleSelectOption: React.FC<SingleSelectOptionProps> = ({
  label,
  value,
  selected,
  onSelect,
  index = 0,
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
    onSelect(value);
  };

  return (
    <Animated.View entering={FadeInUp.duration(300).delay(index * 50)}>
      <AnimatedPressable
        style={[
          styles.option,
          {
            backgroundColor: selected
              ? `${colors.accent}15`
              : colors.surfaceLight,
            borderColor: selected ? colors.accent : 'transparent',
          },
          animatedStyle,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}>
        <Text
          variant="bodyMedium"
          style={{
            color: selected ? colors.accent : colors.text.primary,
            fontWeight: selected ? '600' : '500',
          }}>
          {label}
        </Text>
      </AnimatedPressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  option: {
    height: 56,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 2,
  },
});

export default SingleSelectOption;
