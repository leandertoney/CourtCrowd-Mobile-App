import React from 'react';
import {View, StyleSheet, Image, ViewStyle, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useColors} from '../../contexts/ThemeContext';
import {spacing, componentSizes} from '../../utilities/theme';
import {IconButton} from '../ui/Button';
import {DisplayTitle} from '../ui/Text';
import {CountBadge} from '../ui/Badge';

// Import logo
const images = require('../../assets/images');

// =============================================================================
// TYPES
// =============================================================================

interface HeaderProps {
  title?: string;
  showLogo?: boolean;
  showBack?: boolean;
  rightActions?: React.ReactNode;
  leftActions?: React.ReactNode;
  transparent?: boolean;
  style?: ViewStyle;
}

interface HeaderActionProps {
  icon: React.ReactNode;
  onPress: () => void;
  badge?: number;
}

// =============================================================================
// HEADER COMPONENT
// =============================================================================

const Header: React.FC<HeaderProps> = ({
  title,
  showLogo = false,
  showBack = false,
  rightActions,
  leftActions,
  transparent = false,
  style,
}) => {
  const colors = useColors();
  const navigation = useNavigation();

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: transparent ? 'transparent' : colors.background,
          borderBottomColor: transparent ? 'transparent' : colors.border,
        },
        style,
      ]}>
      <View style={styles.leftSection}>
        {showBack && (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <BackArrowIcon color={colors.text.primary} />
          </TouchableOpacity>
        )}
        {leftActions}
        {showLogo && (
          <Image
            source={images.HomeTitle}
            style={styles.logo}
            resizeMode="contain"
          />
        )}
        {title && !showLogo && (
          <DisplayTitle style={styles.title}>{title}</DisplayTitle>
        )}
      </View>

      <View style={styles.rightSection}>{rightActions}</View>
    </View>
  );
};

// =============================================================================
// HEADER ACTION COMPONENT
// =============================================================================

export const HeaderAction: React.FC<HeaderActionProps> = ({
  icon,
  onPress,
  badge,
}) => {
  return (
    <View style={styles.actionContainer}>
      <IconButton icon={icon} onPress={onPress} size="md" variant="ghost" />
      {badge !== undefined && badge > 0 && (
        <View style={styles.badge}>
          <CountBadge count={badge} />
        </View>
      )}
    </View>
  );
};

// =============================================================================
// BACK ARROW ICON (inline SVG alternative)
// =============================================================================

const BackArrowIcon: React.FC<{color: string}> = ({color}) => (
  <View style={styles.backArrow}>
    <View
      style={[
        styles.arrowLine,
        styles.arrowTop,
        {backgroundColor: color},
      ]}
    />
    <View
      style={[
        styles.arrowLine,
        styles.arrowBottom,
        {backgroundColor: color},
      ]}
    />
  </View>
);

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  header: {
    height: componentSizes.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 0,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  logo: {
    height: 28,
    width: 140,
  },
  title: {
    fontSize: 24,
  },
  backButton: {
    padding: spacing.sm,
    marginLeft: -spacing.sm,
    marginRight: spacing.sm,
  },
  backArrow: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowLine: {
    position: 'absolute',
    width: 12,
    height: 2,
    borderRadius: 1,
  },
  arrowTop: {
    transform: [{rotate: '-45deg'}, {translateY: -4}],
  },
  arrowBottom: {
    transform: [{rotate: '45deg'}, {translateY: 4}],
  },
  actionContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
});

export default Header;
