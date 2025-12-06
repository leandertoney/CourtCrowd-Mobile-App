import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {useColors} from '../../contexts/ThemeContext';
import {
  typography,
  spacing,
  borderRadius,
  componentSizes,
  animation,
} from '../../utilities/theme';
import Text from './Text';

// =============================================================================
// TYPES
// =============================================================================

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

// =============================================================================
// COMPONENT
// =============================================================================

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
}) => {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, animation.spring);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, animation.spring);
  };

  const getBackgroundColor = () => {
    if (disabled) {
      return colors.surfaceLight;
    }
    switch (variant) {
      case 'primary':
        return colors.accent;
      case 'secondary':
        return colors.surface;
      case 'ghost':
        return 'transparent';
      case 'outline':
        return 'transparent';
      default:
        return colors.accent;
    }
  };

  const getBorderColor = () => {
    if (disabled) {
      return colors.surfaceLight;
    }
    switch (variant) {
      case 'outline':
        return colors.accent;
      default:
        return 'transparent';
    }
  };

  const getTextColor = () => {
    if (disabled) {
      return colors.text.tertiary;
    }
    switch (variant) {
      case 'primary':
        return colors.text.inverse;
      case 'secondary':
        return colors.text.primary;
      case 'ghost':
        return colors.accent;
      case 'outline':
        return colors.accent;
      default:
        return colors.text.inverse;
    }
  };

  const getHeight = () => {
    return componentSizes.buttonHeight[size];
  };

  const getPadding = () => {
    switch (size) {
      case 'sm':
        return spacing.md;
      case 'md':
        return spacing.lg;
      case 'lg':
        return spacing.xl;
      default:
        return spacing.lg;
    }
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.9}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1.5 : 0,
          height: getHeight(),
          paddingHorizontal: getPadding(),
          borderRadius: borderRadius.full,
        },
        fullWidth && styles.fullWidth,
        animatedStyle,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator
          color={getTextColor()}
          size={size === 'sm' ? 'small' : 'small'}
        />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <Text
            variant={size === 'sm' ? 'buttonSmall' : 'button'}
            style={[
              {color: getTextColor()},
              leftIcon && {marginLeft: spacing.sm},
              rightIcon && {marginRight: spacing.sm},
              textStyle,
            ]}>
            {title}
          </Text>
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </AnimatedTouchable>
  );
};

// =============================================================================
// ICON BUTTON
// =============================================================================

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'filled' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = 'md',
  variant = 'ghost',
  disabled = false,
  style,
}) => {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, animation.spring);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, animation.spring);
  };

  const getSize = () => {
    switch (size) {
      case 'sm':
        return 32;
      case 'md':
        return 40;
      case 'lg':
        return 48;
    }
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.iconButton,
        {
          width: getSize(),
          height: getSize(),
          borderRadius: getSize() / 2,
          backgroundColor:
            variant === 'filled' ? colors.surfaceLight : 'transparent',
          opacity: disabled ? 0.5 : 1,
        },
        animatedStyle,
        style,
      ]}>
      {icon}
    </AnimatedTouchable>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Button;
