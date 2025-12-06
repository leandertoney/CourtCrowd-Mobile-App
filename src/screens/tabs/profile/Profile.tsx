import React, {useState, useCallback, useEffect} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Share,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useColors} from '../../../contexts/ThemeContext';
import Text from '../../../components/ui/Text';
import {spacing} from '../../../utilities/theme';
import {useAppSelector} from '../../../store';
import {supabase} from '../../../lib/supabase';
import Toast from 'react-native-toast-message';
import Svg, {Path, Circle} from 'react-native-svg';

// Import profile components
import {
  ProfileHeader,
  ProfileStats,
  RatingInput,
  RecentActivity,
} from '../../../components/profile';

// =============================================================================
// ICONS
// =============================================================================

const SettingsIcon: React.FC<{color: string; size?: number}> = ({color, size = 24}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
    <Path
      d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
      stroke={color}
      strokeWidth="2"
    />
  </Svg>
);

// =============================================================================
// PROFILE SCREEN
// =============================================================================

interface UserStats {
  checkins: number;
  favorites: number;
  followers: number;
  following: number;
  duprRating: number | null;
  duprId: string | null;
}

const Profile: React.FC = () => {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const user = useAppSelector(state => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);
  const [savingRating, setSavingRating] = useState(false);
  const [stats, setStats] = useState<UserStats>({
    checkins: 0,
    favorites: 0,
    followers: 0,
    following: 0,
    duprRating: null,
    duprId: null,
  });
  const [userDetails, setUserDetails] = useState<{
    city: string | null;
    state: string | null;
  }>({city: null, state: null});

  // Fetch user stats
  const fetchStats = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Fetch stats in parallel
      const [
        checkinsResult,
        favoritesResult,
        followersResult,
        followingResult,
        userResult,
      ] = await Promise.all([
        // Check-ins count
        supabase
          .from('court_presence')
          .select('id', {count: 'exact', head: true})
          .eq('user_id', user.id),
        // Favorites count
        supabase
          .from('favorites')
          .select('id', {count: 'exact', head: true})
          .eq('user_id', user.id),
        // Followers count
        supabase
          .from('follows')
          .select('id', {count: 'exact', head: true})
          .eq('following_id', user.id),
        // Following count
        supabase
          .from('follows')
          .select('id', {count: 'exact', head: true})
          .eq('follower_id', user.id),
        // User details (DUPR rating, location)
        supabase
          .from('users')
          .select('dupr_rating, dupr_id, city, state')
          .eq('id', user.id)
          .single(),
      ]);

      setStats({
        checkins: checkinsResult.count || 0,
        favorites: favoritesResult.count || 0,
        followers: followersResult.count || 0,
        following: followingResult.count || 0,
        duprRating: userResult.data?.dupr_rating || null,
        duprId: userResult.data?.dupr_id || null,
      });

      setUserDetails({
        city: userResult.data?.city || null,
        state: userResult.data?.state || null,
      });
    } catch (error) {
      console.error('Error fetching profile stats:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  }, [fetchStats]);

  const handleEditProfile = useCallback(() => {
    navigation.navigate('EditProfile');
  }, [navigation]);

  const handleShareProfile = useCallback(async () => {
    try {
      await Share.share({
        message: `Check out ${user?.name || 'my'} profile on Court Crowd! 🏓`,
        // In the future, add deep link: url: `courtcrowd://profile/${user?.id}`
      });
    } catch (error) {
      console.error('Error sharing profile:', error);
    }
  }, [user?.name]);

  const handleFollowersPress = useCallback(() => {
    navigation.navigate('FollowersList', {type: 'followers'});
  }, [navigation]);

  const handleFollowingPress = useCallback(() => {
    navigation.navigate('FollowersList', {type: 'following'});
  }, [navigation]);

  const handleSaveRating = useCallback(
    async (rating: number, duprId?: string) => {
      if (!user?.id) return;

      setSavingRating(true);
      try {
        const {error} = await supabase
          .from('users')
          .update({
            dupr_rating: rating,
            dupr_id: duprId || null,
          })
          .eq('id', user.id);

        if (error) throw error;

        setStats(prev => ({
          ...prev,
          duprRating: rating,
          duprId: duprId || null,
        }));

        Toast.show({
          type: 'success',
          text1: 'Rating Updated',
          text2: `Your DUPR rating is now ${rating.toFixed(2)}`,
        });
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message || 'Failed to save rating',
        });
      } finally {
        setSavingRating(false);
      }
    },
    [user?.id],
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingTop: insets.top + spacing.sm},
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }>
        {/* Settings Icon Header */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <TouchableOpacity
            style={[styles.settingsButton, {backgroundColor: colors.surface}]}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.7}>
            <SettingsIcon color={colors.text.primary} size={22} />
          </TouchableOpacity>
        </View>

        {/* Profile Header */}
        <ProfileHeader
          avatarUrl={user?.photo?.url}
          name={user?.name || 'Player'}
          nickname={user?.nickName}
          city={userDetails.city}
          state={userDetails.state}
          onEditProfile={handleEditProfile}
          onShareProfile={handleShareProfile}
        />

        {/* Stats */}
        <View style={styles.section}>
          <ProfileStats
            checkins={stats.checkins}
            favorites={stats.favorites}
            followers={stats.followers}
            following={stats.following}
            onFollowersPress={handleFollowersPress}
            onFollowingPress={handleFollowingPress}
          />
        </View>

        {/* DUPR Rating */}
        <View style={styles.section}>
          <RatingInput
            currentRating={stats.duprRating}
            duprId={stats.duprId}
            onSave={handleSaveRating}
            loading={savingRating}
          />
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <RecentActivity userId={user?.id} limit={5} />
        </View>

        {/* App Version */}
        <Text variant="caption" color="tertiary" style={styles.versionText}>
          Court Crowd v1.0.0
        </Text>
      </ScrollView>
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
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerSpacer: {
    width: 44,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: spacing.md,
  },
  versionText: {
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
});

export default Profile;
