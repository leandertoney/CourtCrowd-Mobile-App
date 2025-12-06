import React from 'react';
import {View, Image, StyleSheet, ViewStyle} from 'react-native';
import {useColors} from '../../contexts/ThemeContext';
import {componentSizes, borderRadius, fonts} from '../../utilities/theme';
import Text from './Text';

// =============================================================================
// TYPES
// =============================================================================

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  source?: {uri: string} | null;
  imageUrl?: string | null;
  name?: string;
  size?: AvatarSize;
  showBorder?: boolean;
  borderColor?: string;
  style?: ViewStyle;
}

interface AvatarStackProps {
  avatars?: Array<{
    source?: {uri: string} | null;
    imageUrl?: string | null;
    name?: string;
  }>;
  users?: Array<{
    name?: string;
    imageUrl?: string | null;
  }>;
  size?: AvatarSize;
  max?: number;
  showOverflow?: boolean;
}

// =============================================================================
// AVATAR COMPONENT
// =============================================================================

const Avatar: React.FC<AvatarProps> = ({
  source,
  imageUrl,
  name,
  size = 'md',
  showBorder = false,
  borderColor,
  style,
}) => {
  const colors = useColors();
  const avatarSize = componentSizes.avatarSize[size];

  // Generate initials from name
  const getInitials = (fullName?: string) => {
    if (!fullName) return '?';
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Generate background color from name
  const getBackgroundColor = (fullName?: string) => {
    if (!fullName) return colors.surfaceLight;
    const charCode = fullName.charCodeAt(0);
    const hue = (charCode * 137) % 360; // Golden angle for distribution
    return `hsl(${hue}, 60%, 45%)`;
  };

  const getFontSize = () => {
    switch (size) {
      case 'xs':
        return 10;
      case 'sm':
        return 12;
      case 'md':
        return 16;
      case 'lg':
        return 22;
      case 'xl':
        return 32;
      default:
        return 16;
    }
  };

  const containerStyle = [
    styles.container,
    {
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarSize / 2,
      backgroundColor: getBackgroundColor(name),
    },
    showBorder && {
      borderWidth: 2,
      borderColor: borderColor || colors.background,
    },
    style,
  ];

  // Use imageUrl or source
  const imageSource = imageUrl ? {uri: imageUrl} : source;

  if (imageSource?.uri) {
    return (
      <View style={containerStyle}>
        <Image
          source={imageSource}
          style={[
            styles.image,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
            },
          ]}
        />
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <Text
        style={[
          styles.initials,
          {
            fontSize: getFontSize(),
            color: colors.text.primary,
          },
        ]}>
        {getInitials(name)}
      </Text>
    </View>
  );
};

// =============================================================================
// AVATAR STACK COMPONENT
// =============================================================================

export const AvatarStack: React.FC<AvatarStackProps> = ({
  avatars,
  users,
  size = 'sm',
  max = 4,
  showOverflow = true,
}) => {
  const colors = useColors();
  const avatarSize = componentSizes.avatarSize[size];
  const overlap = avatarSize * 0.3;

  // Use users if provided, otherwise use avatars
  const items = users
    ? users.map(u => ({name: u.name, imageUrl: u.imageUrl}))
    : avatars || [];

  const visibleAvatars = items.slice(0, max);
  const overflowCount = items.length - max;

  return (
    <View style={styles.stack}>
      {visibleAvatars.map((avatar, index) => (
        <View
          key={index}
          style={[
            styles.stackItem,
            {
              marginLeft: index > 0 ? -overlap : 0,
              zIndex: visibleAvatars.length - index,
            },
          ]}>
          <Avatar
            imageUrl={avatar.imageUrl}
            source={avatar.source}
            name={avatar.name}
            size={size}
            showBorder
            borderColor={colors.background}
          />
        </View>
      ))}
      {showOverflow && overflowCount > 0 && (
        <View
          style={[
            styles.stackItem,
            styles.overflowBadge,
            {
              marginLeft: -overlap,
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
              backgroundColor: colors.surfaceLight,
              borderWidth: 2,
              borderColor: colors.background,
            },
          ]}>
          <Text
            variant="caption"
            style={{color: colors.text.secondary}}>
            +{overflowCount}
          </Text>
        </View>
      )}
    </View>
  );
};

// =============================================================================
// AVATAR WITH BADGE
// =============================================================================

interface AvatarWithBadgeProps extends AvatarProps {
  badgeCount?: number;
  showOnlineDot?: boolean;
  online?: boolean;
}

export const AvatarWithBadge: React.FC<AvatarWithBadgeProps> = ({
  badgeCount,
  showOnlineDot = false,
  online = false,
  ...avatarProps
}) => {
  const colors = useColors();
  const avatarSize = componentSizes.avatarSize[avatarProps.size || 'md'];

  return (
    <View style={styles.badgeContainer}>
      <Avatar {...avatarProps} />
      {badgeCount !== undefined && badgeCount > 0 && (
        <View
          style={[
            styles.badge,
            {
              backgroundColor: colors.error,
              borderColor: colors.background,
            },
          ]}>
          <Text variant="micro" style={{color: colors.white}}>
            {badgeCount > 99 ? '99+' : badgeCount}
          </Text>
        </View>
      )}
      {showOnlineDot && (
        <View
          style={[
            styles.onlineDot,
            {
              backgroundColor: online ? colors.success : colors.text.tertiary,
              borderColor: colors.background,
              bottom: avatarSize * 0.05,
              right: avatarSize * 0.05,
            },
          ]}
        />
      )}
    </View>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
  initials: {
    fontFamily: fonts.semiBold,
  },
  stack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackItem: {
    position: 'relative',
  },
  overflowBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  onlineDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
});

export default Avatar;
