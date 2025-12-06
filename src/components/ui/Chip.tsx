import React from 'react';
import {TouchableOpacity, StyleSheet, View} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {useColors} from '../../contexts/ThemeContext';
import {
  spacing,
  borderRadius,
  componentSizes,
  animation,
} from '../../utilities/theme';
import Text from './Text';

// =============================================================================
// TYPES
// =============================================================================

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  variant?: 'filled' | 'outlined';
}

interface ChipGroupProps {
  chips: Array<{
    label: string;
    value: string;
    icon?: React.ReactNode;
  }>;
  selected: string | string[];
  onSelect: (value: string) => void;
  multiple?: boolean;
}

// =============================================================================
// CHIP COMPONENT
// =============================================================================

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  leftIcon,
  rightIcon,
  disabled = false,
  variant = 'filled',
}) => {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, animation.spring);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, animation.spring);
  };

  const getBackgroundColor = () => {
    if (disabled) {
      return colors.surfaceLight;
    }
    if (selected) {
      return colors.accent;
    }
    if (variant === 'outlined') {
      return 'transparent';
    }
    return colors.surfaceLight;
  };

  const getBorderColor = () => {
    if (selected) {
      return colors.accent;
    }
    if (variant === 'outlined') {
      return colors.border;
    }
    return 'transparent';
  };

  const getTextColor = () => {
    if (disabled) {
      return colors.text.tertiary;
    }
    if (selected) {
      return colors.text.inverse;
    }
    return colors.text.primary;
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || !onPress}
      activeOpacity={0.8}
      style={[
        styles.chip,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outlined' ? 1 : 0,
        },
        animatedStyle,
      ]}>
      {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
      <Text
        variant="label"
        style={[styles.label, {color: getTextColor()}]}>
        {label}
      </Text>
      {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
    </AnimatedTouchable>
  );
};

// =============================================================================
// CHIP GROUP COMPONENT
// =============================================================================

export const ChipGroup: React.FC<ChipGroupProps> = ({
  chips,
  selected,
  onSelect,
  multiple = false,
}) => {
  const isSelected = (value: string) => {
    if (Array.isArray(selected)) {
      return selected.includes(value);
    }
    return selected === value;
  };

  return (
    <View style={styles.chipGroup}>
      {chips.map(chip => (
        <Chip
          key={chip.value}
          label={chip.label}
          leftIcon={chip.icon}
          selected={isSelected(chip.value)}
          onPress={() => onSelect(chip.value)}
        />
      ))}
    </View>
  );
};

// =============================================================================
// FILTER CHIPS (Horizontal scrollable)
// =============================================================================

import {ScrollView} from 'react-native';

interface FilterChipsProps {
  chips?: Array<{
    label: string;
    value: string;
    icon?: React.ReactNode;
  }>;
  // Simpler interface using string arrays
  options?: string[];
  selectedOptions?: string[];
  selected?: string;
  onSelect: (value: string) => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  chips,
  options,
  selectedOptions,
  selected,
  onSelect,
}) => {
  // Support both interfaces
  const chipItems = chips || options?.map(opt => ({label: opt, value: opt})) || [];
  const isSelected = (value: string) => {
    if (selectedOptions) {
      return selectedOptions.includes(value);
    }
    return selected === value;
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterChipsContent}
      style={styles.filterChips}>
      {chipItems.map(chip => (
        <Chip
          key={chip.value}
          label={chip.label}
          leftIcon={chip.icon}
          selected={isSelected(chip.value)}
          onPress={() => onSelect(chip.value)}
        />
      ))}
    </ScrollView>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: componentSizes.chipHeight,
    paddingHorizontal: spacing.md,
    borderRadius: componentSizes.chipRadius,
  },
  leftIcon: {
    marginRight: spacing.xs,
  },
  rightIcon: {
    marginLeft: spacing.xs,
  },
  label: {
    letterSpacing: 0,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChips: {
    flexGrow: 0,
  },
  filterChipsContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
});

export default Chip;
