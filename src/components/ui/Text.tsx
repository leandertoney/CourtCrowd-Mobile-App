import React from 'react';
import {Text as RNText, TextProps as RNTextProps, StyleSheet} from 'react-native';
import {useColors} from '../../contexts/ThemeContext';
import {typography, fonts} from '../../utilities/theme';

// =============================================================================
// TYPES
// =============================================================================

type TextVariant =
  | 'display'
  | 'displaySmall'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'body'
  | 'bodyMedium'
  | 'bodySmall'
  | 'caption'
  | 'label'
  | 'micro'
  | 'button'
  | 'buttonSmall';

type TextColor = 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'accent' | 'error' | 'success';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: TextColor;
  center?: boolean;
  children: React.ReactNode;
}

// =============================================================================
// COMPONENT
// =============================================================================

const Text: React.FC<TextProps> = ({
  variant = 'body',
  color = 'primary',
  center = false,
  style,
  children,
  ...props
}) => {
  const colors = useColors();

  const getColor = () => {
    switch (color) {
      case 'primary':
        return colors.text.primary;
      case 'secondary':
        return colors.text.secondary;
      case 'tertiary':
        return colors.text.tertiary;
      case 'inverse':
        return colors.text.inverse;
      case 'accent':
        return colors.accent;
      case 'error':
        return colors.error;
      case 'success':
        return colors.success;
      default:
        return colors.text.primary;
    }
  };

  return (
    <RNText
      style={[
        typography[variant],
        {color: getColor()},
        center && styles.center,
        style,
      ]}
      {...props}>
      {children}
    </RNText>
  );
};

// =============================================================================
// SPECIALIZED TEXT COMPONENTS
// =============================================================================

// Display title with GAMEDAY font and shadow effect
interface DisplayTitleProps extends Omit<TextProps, 'variant'> {
  shadowColor?: string;
}

export const DisplayTitle: React.FC<DisplayTitleProps> = ({
  shadowColor = '#C82828',
  style,
  children,
  ...props
}) => {
  const colors = useColors();

  return (
    <RNText
      style={[
        typography.display,
        {
          color: colors.text.primary,
          textShadowColor: shadowColor,
          textShadowOffset: {width: 2, height: 1},
          textShadowRadius: 2,
        },
        style,
      ]}
      {...props}>
      {children}
    </RNText>
  );
};

// Section header component
interface SectionTitleProps extends Omit<TextProps, 'variant'> {}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  style,
  children,
  ...props
}) => {
  return (
    <Text variant="h3" style={style} {...props}>
      {children}
    </Text>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  center: {
    textAlign: 'center',
  },
});

export default Text;
