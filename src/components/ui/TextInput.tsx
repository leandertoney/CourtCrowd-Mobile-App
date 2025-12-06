import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  TextInput as RNTextInput,
  TextInputProps,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import {useColors} from '../../contexts/ThemeContext';
import {spacing, borderRadius} from '../../utilities/theme';
import Text from './Text';
import Svg, {Path, Circle} from 'react-native-svg';

// =============================================================================
// ICONS
// =============================================================================

const EyeIcon: React.FC<{color: string; size?: number}> = ({color, size = 20}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
  </Svg>
);

const EyeOffIcon: React.FC<{color: string; size?: number}> = ({color, size = 20}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path d="M1 1l22 22" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

// =============================================================================
// TYPES
// =============================================================================

interface ThemedTextInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string | false;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  variant?: 'default' | 'filled' | 'outlined';
}

// =============================================================================
// THEMED TEXT INPUT
// =============================================================================

const ThemedTextInput: React.FC<ThemedTextInputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  isPassword = false,
  containerStyle,
  inputStyle,
  variant = 'default',
  secureTextEntry,
  ...props
}) => {
  const colors = useColors();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const getBackgroundColor = () => {
    switch (variant) {
      case 'filled':
        return colors.surfaceLight;
      case 'outlined':
        return 'transparent';
      default:
        return 'transparent';
    }
  };

  const getBorderColor = () => {
    if (error) return colors.error;
    if (isFocused) return colors.accent;
    switch (variant) {
      case 'outlined':
        return colors.border;
      case 'default':
        return colors.border;
      default:
        return 'transparent';
    }
  };

  const handlePasswordToggle = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const showSecure = isPassword ? !isPasswordVisible : secureTextEntry;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text variant="label" color="secondary" style={styles.label}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          variant === 'outlined' && styles.outlinedContainer,
          variant === 'filled' && styles.filledContainer,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor(),
            borderBottomColor: variant === 'default' ? getBorderColor() : undefined,
          },
          inputStyle,
        ]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <RNTextInput
          style={[
            styles.input,
            {color: colors.text.primary},
            leftIcon && {paddingLeft: 0},
          ]}
          placeholderTextColor={colors.text.tertiary}
          onFocus={e => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={e => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          secureTextEntry={showSecure}
          keyboardAppearance="dark"
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={handlePasswordToggle}
            style={styles.rightIcon}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            {isPasswordVisible ? (
              <EyeOffIcon color={colors.text.tertiary} />
            ) : (
              <EyeIcon color={colors.text.tertiary} />
            )}
          </TouchableOpacity>
        )}
        {!isPassword && rightIcon && (
          <View style={styles.rightIcon}>{rightIcon}</View>
        )}
      </View>
      {error && (
        <Text variant="caption" style={[styles.error, {color: colors.error}]}>
          {error}
        </Text>
      )}
      {hint && !error && (
        <Text variant="caption" color="tertiary" style={styles.hint}>
          {hint}
        </Text>
      )}
    </View>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: spacing.sm,
  },
  outlinedContainer: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
  },
  filledContainer: {
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 0,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: spacing.xs,
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  rightIcon: {
    marginLeft: spacing.sm,
  },
  error: {
    marginTop: spacing.xs,
  },
  hint: {
    marginTop: spacing.xs,
  },
});

export default ThemedTextInput;
