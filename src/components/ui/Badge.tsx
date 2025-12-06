import React from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';
import {useColors} from '../../contexts/ThemeContext';
import {spacing, borderRadius} from '../../utilities/theme';
import Text from './Text';

// =============================================================================
// TYPES
// =============================================================================

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'premium';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

interface CountBadgeProps {
  count: number;
  max?: number;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

// =============================================================================
// BADGE COMPONENT
// =============================================================================

const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  size = 'md',
  icon,
  style,
}) => {
  const colors = useColors();

  const getBackgroundColor = () => {
    switch (variant) {
      case 'success':
        return `${colors.success}20`;
      case 'warning':
        return `${colors.warning}20`;
      case 'error':
        return `${colors.error}20`;
      case 'info':
        return `${colors.info}20`;
      case 'premium':
        return `${colors.accent}20`;
      default:
        return colors.surfaceLight;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.error;
      case 'info':
        return colors.info;
      case 'premium':
        return colors.accent;
      default:
        return colors.text.secondary;
    }
  };

  const getPadding = () => {
    return size === 'sm'
      ? {paddingHorizontal: spacing.sm, paddingVertical: spacing.xs}
      : {paddingHorizontal: spacing.md, paddingVertical: spacing.xs};
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: getBackgroundColor(),
        },
        getPadding(),
        style,
      ]}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text
        variant={size === 'sm' ? 'micro' : 'caption'}
        style={{color: getTextColor()}}>
        {label}
      </Text>
    </View>
  );
};

// =============================================================================
// COUNT BADGE COMPONENT
// =============================================================================

export const CountBadge: React.FC<CountBadgeProps> = ({
  count,
  max = 99,
  variant = 'error',
  style,
}) => {
  const colors = useColors();

  if (count <= 0) {
    return null;
  }

  const getBackgroundColor = () => {
    switch (variant) {
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.error;
      case 'info':
        return colors.info;
      case 'premium':
        return colors.accent;
      default:
        return colors.error;
    }
  };

  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <View
      style={[
        styles.countBadge,
        {
          backgroundColor: getBackgroundColor(),
          minWidth: displayCount.length > 2 ? 24 : 20,
        },
        style,
      ]}>
      <Text variant="micro" style={{color: colors.white}}>
        {displayCount}
      </Text>
    </View>
  );
};

// =============================================================================
// DOT BADGE (simple indicator)
// =============================================================================

interface DotBadgeProps {
  visible?: boolean;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const DotBadge: React.FC<DotBadgeProps> = ({
  visible = true,
  variant = 'error',
  size = 'sm',
  style,
}) => {
  const colors = useColors();

  if (!visible) {
    return null;
  }

  const getBackgroundColor = () => {
    switch (variant) {
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.error;
      case 'info':
        return colors.info;
      case 'premium':
        return colors.accent;
      default:
        return colors.error;
    }
  };

  const dotSize = size === 'sm' ? 8 : 12;

  return (
    <View
      style={[
        styles.dotBadge,
        {
          backgroundColor: getBackgroundColor(),
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
        },
        style,
      ]}
    />
  );
};

// =============================================================================
// PREMIUM BADGE
// =============================================================================

interface PremiumBadgeProps {
  style?: ViewStyle;
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({style}) => {
  const colors = useColors();

  return (
    <View
      style={[
        styles.premiumBadge,
        {
          backgroundColor: colors.accent,
        },
        style,
      ]}>
      <Text variant="micro" style={{color: colors.text.inverse, fontWeight: '700'}}>
        PREMIUM
      </Text>
    </View>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.xs,
  },
  icon: {
    marginRight: spacing.xs,
  },
  countBadge: {
    height: 20,
    paddingHorizontal: spacing.xs,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotBadge: {},
  premiumBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
});

export default Badge;
