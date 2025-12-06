import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
} from 'react-native';
import {HomeStackParamsList} from '../../../navigation/HomeNavigation';
import {BottomTabParamlist} from '../../../navigation/BottomNavigation';
import {useColors} from '../../../contexts/ThemeContext';
import {spacing, borderRadius} from '../../../utilities/theme';
import Text from '../../../components/ui/Text';
import {SearchBar, LoadingView, EmptyView} from '../../../components';
import {
  useUserSearch,
  useSuggestedUsers,
  UserWithFollowStatus,
} from '../../../hooks/useFriends';
import {useFollows} from '../../../hooks/useCourts';
import {useConversations} from '../../../hooks/useDirectMessages';
import Svg, {Path, Circle} from 'react-native-svg';

type Props = NativeStackScreenProps<
  BottomTabParamlist & HomeStackParamsList,
  'SearchPeople'
>;

// =============================================================================
// ICONS
// =============================================================================

const UserPlusIcon: React.FC<{color: string; size?: number}> = ({
  color,
  size = 20,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="8.5" cy="7" r="4" stroke={color} strokeWidth="2" />
    <Path
      d="M20 8v6M23 11h-6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const UserCheckIcon: React.FC<{color: string; size?: number}> = ({
  color,
  size = 20,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="8.5" cy="7" r="4" stroke={color} strokeWidth="2" />
    <Path
      d="M17 11l2 2 4-4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const MessageIcon: React.FC<{color: string; size?: number}> = ({
  color,
  size = 20,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// =============================================================================
// USER CARD COMPONENT
// =============================================================================

interface UserCardProps {
  user: UserWithFollowStatus;
  onFollow: () => void;
  onMessage: () => void;
  onPress: () => void;
  isCompact?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  onFollow,
  onMessage,
  onPress,
  isCompact = false,
}) => {
  const colors = useColors();

  if (isCompact) {
    return (
      <TouchableOpacity
        style={[styles.compactCard, {backgroundColor: colors.surfaceLight}]}
        onPress={onPress}
        activeOpacity={0.7}>
        {user.avatar_url ? (
          <Image source={{uri: user.avatar_url}} style={styles.compactAvatar} />
        ) : (
          <View
            style={[
              styles.compactAvatarPlaceholder,
              {backgroundColor: colors.accent},
            ]}>
            <Text variant="h4" style={{color: colors.background}}>
              {(user.name || user.email || 'U')[0].toUpperCase()}
            </Text>
          </View>
        )}
        <Text
          variant="bodySmall"
          numberOfLines={1}
          style={styles.compactName}>
          {user.name || 'User'}
        </Text>
        <TouchableOpacity
          style={[
            styles.compactFollowButton,
            {
              backgroundColor: user.isFollowing
                ? colors.surfaceLight
                : colors.accent,
              borderColor: user.isFollowing ? colors.accent : 'transparent',
              borderWidth: user.isFollowing ? 1 : 0,
            },
          ]}
          onPress={onFollow}>
          <Text
            variant="caption"
            style={{
              color: user.isFollowing ? colors.accent : colors.background,
            }}>
            {user.isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.userCard, {backgroundColor: colors.surfaceLight}]}
      onPress={onPress}
      activeOpacity={0.7}>
      {user.avatar_url ? (
        <Image source={{uri: user.avatar_url}} style={styles.avatar} />
      ) : (
        <View
          style={[styles.avatarPlaceholder, {backgroundColor: colors.accent}]}>
          <Text variant="h3" style={{color: colors.background}}>
            {(user.name || user.email || 'U')[0].toUpperCase()}
          </Text>
        </View>
      )}

      <View style={styles.userInfo}>
        <Text variant="bodyLarge" numberOfLines={1}>
          {user.name || 'User'}
        </Text>
        {user.nickname && (
          <Text variant="bodySmall" color="secondary" numberOfLines={1}>
            @{user.nickname}
          </Text>
        )}
        {user.isFollowingMe && (
          <Text variant="caption" color="tertiary">
            Follows you
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, {backgroundColor: colors.surface}]}
          onPress={onMessage}>
          <MessageIcon color={colors.text.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: user.isFollowing ? colors.surface : colors.accent,
            },
          ]}
          onPress={onFollow}>
          {user.isFollowing ? (
            <UserCheckIcon color={colors.accent} />
          ) : (
            <UserPlusIcon color={colors.background} />
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// =============================================================================
// SEARCH PEOPLE SCREEN
// =============================================================================

const SearchPeople: React.FC<Props> = ({navigation}) => {
  const colors = useColors();
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const {results, loading: searchLoading, searchUsers, clearResults} = useUserSearch();
  const {users: suggestedUsers, loading: suggestedLoading, refetch: refetchSuggested} = useSuggestedUsers();
  const {toggleFollow, isFollowing} = useFollows();
  const {startConversation} = useConversations();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchText.trim()) {
        searchUsers(searchText);
      } else {
        clearResults();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText, searchUsers, clearResults]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchSuggested();
    setRefreshing(false);
  }, [refetchSuggested]);

  const handleFollow = useCallback(
    async (userId: string) => {
      await toggleFollow(userId);
      // Refetch to update UI
      if (searchText.trim()) {
        searchUsers(searchText);
      } else {
        refetchSuggested();
      }
    },
    [toggleFollow, searchText, searchUsers, refetchSuggested],
  );

  const handleMessage = useCallback(
    async (user: UserWithFollowStatus) => {
      const {conversationId} = await startConversation(user.id);
      if (conversationId) {
        navigation.navigate('ChatDetail', {
          conversationId,
          otherUser: {
            id: user.id,
            name: user.name,
            avatar_url: user.avatar_url,
          },
        });
      }
    },
    [startConversation, navigation],
  );

  const handleUserPress = useCallback(
    (user: UserWithFollowStatus) => {
      // Navigate to user profile (we can implement this later)
      // For now, just start a message
      handleMessage(user);
    },
    [handleMessage],
  );

  const displayUsers = searchText.trim() ? results : suggestedUsers;
  const isLoading = searchText.trim() ? searchLoading : suggestedLoading;

  // Add follow status from current state
  const usersWithCurrentStatus = displayUsers.map(user => ({
    ...user,
    isFollowing: isFollowing(user.id),
  }));

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <SearchBar
        placeholder="Search by name or email"
        containerStyle={styles.searchContainer}
        value={searchText}
        onChangeText={setSearchText}
      />

      {!searchText.trim() && (
        <View style={styles.sectionHeader}>
          <Text variant="h4">People you may know</Text>
          <TouchableOpacity onPress={handleRefresh}>
            <Text variant="bodySmall" style={{color: colors.accent}}>
              Refresh
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {searchText.trim() && results.length > 0 && (
        <View style={styles.sectionHeader}>
          <Text variant="bodySmall" color="secondary">
            {results.length} {results.length === 1 ? 'result' : 'results'}
          </Text>
        </View>
      )}

      {isLoading ? (
        <LoadingView />
      ) : (
        <FlatList
          data={usersWithCurrentStatus}
          keyExtractor={item => item.id}
          numColumns={searchText.trim() ? 1 : 2}
          key={searchText.trim() ? 'list' : 'grid'}
          columnWrapperStyle={!searchText.trim() ? styles.gridRow : undefined}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({item}) => (
            <UserCard
              user={item}
              isCompact={!searchText.trim()}
              onFollow={() => handleFollow(item.id)}
              onMessage={() => handleMessage(item)}
              onPress={() => handleUserPress(item)}
            />
          )}
          ListEmptyComponent={
            <EmptyView
              message={
                searchText.trim()
                  ? 'No users found'
                  : 'No suggestions available'
              }
              subMessage={
                searchText.trim()
                  ? 'Try a different search term'
                  : 'Check back later for new people to follow'
              }
            />
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.accent}
            />
          }
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
    flex: 1,
  },
  searchContainer: {
    marginTop: spacing.sm,
    marginHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 130,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  // Full user card styles
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginHorizontal: spacing.sm,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: spacing.md,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Compact card styles
  compactCard: {
    width: '48%',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
  },
  compactAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: spacing.sm,
  },
  compactAvatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactName: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  compactFollowButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
});

export default SearchPeople;
