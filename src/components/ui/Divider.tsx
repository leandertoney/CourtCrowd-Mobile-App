import React from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';
import {useColors} from '../../contexts/ThemeContext';
import {spacing} from '../../utilities/theme';
import Text from './Text';

// =============================================================================
// TYPES
// =============================================================================

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  thickness?: number;
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

interface DividerWithLabelProps extends Omit<DividerProps, 'orientation'> {
  label: string;
}

// =============================================================================
// DIVIDER COMPONENT
// =============================================================================

const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  thickness = 1,
  spacing: spacingProp = 'md',
  style,
}) => {
  const colors = useColors();

  const getSpacing = () => {
    switch (spacingProp) {
      case 'none':
        return 0;
      case 'sm':
        return spacing.sm;
      case 'md':
        return spacing.md;
      case 'lg':
        return spacing.lg;
      default:
        return spacing.md;
    }
  };

  if (orientation === 'vertical') {
    return (
      <View
        style={[
          styles.vertical,
          {
            width: thickness,
            backgroundColor: colors.divider,
            marginHorizontal: getSpacing(),
          },
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.horizontal,
        {
          height: thickness,
          backgroundColor: colors.divider,
          marginVertical: getSpacing(),
        },
        style,
      ]}
    />
  );
};

// =============================================================================
// DIVIDER WITH LABEL
// =============================================================================

export const DividerWithLabel: React.FC<DividerWithLabelProps> = ({
  label,
  thickness = 1,
  spacing: spacingProp = 'md',
  style,
}) => {
  const colors = useColors();

  const getSpacing = () => {
    switch (spacingProp) {
      case 'none':
        return 0;
      case 'sm':
        return spacing.sm;
      case 'md':
        return spacing.md;
      case 'lg':
        return spacing.lg;
      default:
        return spacing.md;
    }
  };

  return (
    <View
      style={[
        styles.labelContainer,
        {marginVertical: getSpacing()},
        style,
      ]}>
      <View
        style={[
          styles.labelLine,
          {
            height: thickness,
            backgroundColor: colors.divider,
          },
        ]}
      />
      <Text variant="caption" color="tertiary" style={styles.label}>
        {label}
      </Text>
      <View
        style={[
          styles.labelLine,
          {
            height: thickness,
            backgroundColor: colors.divider,
          },
        ]}
      />
    </View>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  horizontal: {
    width: '100%',
  },
  vertical: {
    height: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelLine: {
    flex: 1,
  },
  label: {
    paddingHorizontal: spacing.md,
  },
});

export default Divider;
