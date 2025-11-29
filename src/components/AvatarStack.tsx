import React from 'react';
import {View, Image, Text, Pressable, StyleSheet} from 'react-native';
import {colors} from '../utilities/theme';

interface User {
  id: string;
  name: string | null;
  avatar_url: string | null;
}

interface AvatarStackProps {
  users: User[];
  onPress?: () => void;
  maxDisplay?: number;
  size?: 'small' | 'medium' | 'large';
}

const SIZES = {
  small: 24,
  medium: 32,
  large: 40,
};

const DEFAULT_AVATAR =
  'https://ui-avatars.com/api/?background=CAFF00&color=000&bold=true&name=';

export function AvatarStack({
  users,
  onPress,
  maxDisplay = 3,
  size = 'medium',
}: AvatarStackProps) {
  const avatarSize = SIZES[size];
  const displayUsers = users.slice(0, maxDisplay);
  const overflow = users.length - maxDisplay;

  if (!users.length) {
    return (
      <Pressable onPress={onPress} style={styles.emptyContainer}>
        <View style={[styles.emptyMarker, {width: avatarSize, height: avatarSize}]}>
          <Text style={styles.emptyText}>0</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} style={styles.container}>
      {displayUsers.map((user, index) => (
        <Image
          key={user.id}
          source={{
            uri: user.avatar_url || `${DEFAULT_AVATAR}${encodeURIComponent(user.name || '?')}`,
          }}
          style={[
            styles.avatar,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
              marginLeft: index > 0 ? -avatarSize * 0.25 : 0,
              zIndex: maxDisplay - index,
            },
          ]}
        />
      ))}
      {overflow > 0 && (
        <View
          style={[
            styles.overflow,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
              marginLeft: -avatarSize * 0.25,
            },
          ]}>
          <Text style={[styles.overflowText, {fontSize: avatarSize * 0.4}]}>
            +{overflow}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    borderWidth: 2,
    borderColor: colors.black,
    backgroundColor: colors.gray2,
  },
  overflow: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.black,
  },
  overflowText: {
    fontWeight: 'bold',
    color: colors.black,
  },
  emptyMarker: {
    backgroundColor: colors.gray2,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 12,
    color: colors.gray3,
    fontWeight: '600',
  },
});
