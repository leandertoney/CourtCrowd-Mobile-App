import React from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {useColors} from '../../contexts/ThemeContext';
import {spacing} from '../../utilities/theme';
import Text from '../ui/Text';

// =============================================================================
// STAT ITEM
// =============================================================================

interface StatItemProps {
  value: number;
  label: string;
  onPress?: () => void;
}

const StatItem: React.FC<StatItemProps> = ({value, label, onPress}) => {
  const colors = useColors();

  const content = (
    <View style={styles.statItem}>
      <Text variant="h3" style={{fontWeight: '700'}}>
        {value.toLocaleString()}
      </Text>
      <Text variant="caption" color="tertiary">
        {label}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

// =============================================================================
// PROFILE STATS COMPONENT
// =============================================================================

interface ProfileStatsProps {
  checkins: number;
  favorites: number;
  followers: number;
  following: number;
  onFollowersPress?: () => void;
  onFollowingPress?: () => void;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({
  checkins,
  favorites,
  followers,
  following,
  onFollowersPress,
  onFollowingPress,
}) => {
  const colors = useColors();

  return (
    <View style={[styles.container, {backgroundColor: colors.surface}]}>
      <StatItem value={checkins} label="Check-ins" />
      <View style={[styles.divider, {backgroundColor: colors.border}]} />
      <StatItem value={favorites} label="Favorites" />
      <View style={[styles.divider, {backgroundColor: colors.border}]} />
      <StatItem value={followers} label="Followers" onPress={onFollowersPress} />
      <View style={[styles.divider, {backgroundColor: colors.border}]} />
      <StatItem value={following} label="Following" onPress={onFollowingPress} />
    </View>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    borderRadius: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  divider: {
    width: 1,
    height: 40,
  },
});

export default ProfileStats;
