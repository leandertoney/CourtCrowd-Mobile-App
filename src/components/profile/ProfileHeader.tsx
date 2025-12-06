import React from 'react';
import {View, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {useColors} from '../../contexts/ThemeContext';
import {spacing, borderRadius} from '../../utilities/theme';
import Text from '../ui/Text';
import Avatar from '../ui/Avatar';
import Svg, {Path} from 'react-native-svg';

// =============================================================================
// ICONS
// =============================================================================

const LocationIcon: React.FC<{color: string; size?: number}> = ({
  color,
  size = 14,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
      stroke={color}
      strokeWidth="2"
    />
    <Path
      d="M12 13a3 3 0 100-6 3 3 0 000 6z"
      stroke={color}
      strokeWidth="2"
    />
  </Svg>
);

const ShareIcon: React.FC<{color: string; size?: number}> = ({
  color,
  size = 18,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8a3 3 0 100-6 3 3 0 000 6zM6 15a3 3 0 100-6 3 3 0 000 6zM18 22a3 3 0 100-6 3 3 0 000 6z"
      stroke={color}
      strokeWidth="2"
    />
    <Path
      d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

// =============================================================================
// PROFILE HEADER COMPONENT
// =============================================================================

interface ProfileHeaderProps {
  avatarUrl?: string | null;
  name: string;
  nickname?: string | null;
  city?: string | null;
  state?: string | null;
  onEditProfile: () => void;
  onShareProfile?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  avatarUrl,
  name,
  nickname,
  city,
  state,
  onEditProfile,
  onShareProfile,
}) => {
  const colors = useColors();

  const location =
    city && state
      ? `${city}, ${state}`
      : city || state || null;

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Avatar
          imageUrl={avatarUrl}
          name={name}
          size="xxl"
          showBorder
          borderColor={colors.accent}
        />
      </View>

      {/* Name & Info */}
      <View style={styles.infoContainer}>
        <Text variant="h2">{name || 'Player'}</Text>
        {nickname && (
          <Text variant="body" color="secondary" style={styles.nickname}>
            @{nickname}
          </Text>
        )}
        {location && (
          <View style={styles.locationRow}>
            <LocationIcon color={colors.text.tertiary} size={14} />
            <Text variant="bodySmall" color="tertiary" style={styles.locationText}>
              {location}
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.editButton, {backgroundColor: colors.accent}]}
          onPress={onEditProfile}
          activeOpacity={0.8}>
          <Text variant="label" style={{color: colors.background}}>
            Edit Profile
          </Text>
        </TouchableOpacity>

        {onShareProfile && (
          <TouchableOpacity
            style={[styles.shareButton, {backgroundColor: colors.surfaceLight}]}
            onPress={onShareProfile}
            activeOpacity={0.8}>
            <ShareIcon color={colors.text.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  nickname: {
    marginTop: spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  locationText: {
    marginLeft: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  editButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProfileHeader;
