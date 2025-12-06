import React, {useEffect, useState, useMemo, useCallback, useRef} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {HomeStackParamsList} from '../../../navigation/HomeNavigation';
import {BottomTabParamlist} from '../../../navigation/BottomNavigation';
import {useColors} from '../../../contexts/ThemeContext';
import {spacing, borderRadius, componentSizes} from '../../../utilities/theme';
import {images} from '../../../assets/images';
import {supabase} from '../../../lib/supabase';
import Svg, {Path, Circle} from 'react-native-svg';

// Components
import Text from '../../../components/ui/Text';
import {FilterChips} from '../../../components/ui/Chip';
import {CourtCard} from '../../../components/courts';
import Card from '../../../components/ui/Card';

// Hooks
import {useCourts, useFavorites, CourtWithDistance} from '../../../hooks/useCourts';
import {useCourtPresence, useRecentActivity} from '../../../hooks/useCourtPresence';

// Components - Home
import ActivityTicker from '../../../components/home/ActivityTicker';
import PersonalizedGreeting from '../../../components/home/PersonalizedGreeting';
import Leaderboard from '../../../components/home/Leaderboard';

// =============================================================================
// EXTENDED COURT TYPE
// =============================================================================

interface CourtWithPresence extends CourtWithDistance {
  onlineUsers?: Array<{
    id: string;
    name?: string;
    photo?: string;
  }>;
}

// =============================================================================
// TYPES
// =============================================================================

type Props = NativeStackScreenProps<
  BottomTabParamlist & HomeStackParamsList,
  'Home'
>;

interface FilterOption {
  id: string;
  label: string;
}

// =============================================================================
// ICONS
// =============================================================================

const UsersIcon: React.FC<{color: string; size?: number}> = ({color, size = 20}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth="2" />
    <Path
      d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const LocationIcon: React.FC<{color: string; size?: number}> = ({color, size = 20}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
      stroke={color}
      strokeWidth="2"
    />
    <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth="2" />
  </Svg>
);

// =============================================================================
// FILTER OPTIONS
// =============================================================================

const FILTER_OPTIONS: FilterOption[] = [
  {id: 'all', label: 'All'},
  {id: 'indoor', label: 'Indoor'},
  {id: 'outdoor', label: 'Outdoor'},
  {id: 'nearby', label: 'Nearby'},
  {id: 'favorites', label: 'Favorites'},
];

// =============================================================================
// HOME SCREEN
// =============================================================================

const Home: React.FC<Props> = ({navigation}) => {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {courts, loading, refetch} = useCourts();
  const {toggleFavorite, isFavorite, favoriteIds} = useFavorites();

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Get recent activity for ticker
  const {activities: recentActivities, refetch: refetchActivities} = useRecentActivity(15);

  // Get court IDs for presence subscription
  const courtIds = useMemo(() => courts.map(c => c.id), [courts]);
  const {presence, refetch: refetchPresence} = useCourtPresence(courtIds);

  // Merge courts with presence data
  const courtsWithPresence: CourtWithPresence[] = useMemo(() => {
    return courts.map(court => ({
      ...court,
      onlineUsers: presence[court.id]?.users.map(u => ({
        id: u.id,
        name: u.name || undefined,
        photo: u.avatar_url || undefined,
      })) || [],
    }));
  }, [courts, presence]);

  // Subscribe to court changes in real-time
  useEffect(() => {
    const subscription = supabase
      .channel('courts-changes')
      .on(
        'postgres_changes',
        {event: '*', schema: 'public', table: 'courts'},
        () => {
          refetch();
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [refetch]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchPresence(), refetchActivities()]);
    setRefreshing(false);
  }, [refetch, refetchPresence, refetchActivities]);

  // Handle activity ticker item press
  const handleActivityPress = useCallback(
    (activity: {court_id: string; court_name: string}) => {
      // Find the court in our list or create a minimal place object
      const court = courtsWithPresence.find(c => c.id === activity.court_id);
      if (court) {
        handleCourtPress(court);
      } else {
        // Navigate with minimal info if court not in local list
        navigation.navigate('CourtDetails', {
          court: {
            id: activity.court_id,
            place_id: activity.court_id,
            name: activity.court_name,
            geometry: {location: {lat: 0, lng: 0}},
            isFavorite: false,
          },
        });
      }
    },
    [courtsWithPresence, navigation],
  );

  // Filter courts based on selected filter
  const filteredCourts = useMemo(() => {
    switch (selectedFilter) {
      case 'nearby':
        return courtsWithPresence.filter(c => c.distance != null && c.distance <= 5);
      case 'favorites':
        return courtsWithPresence.filter(c => favoriteIds.has(c.id));
      case 'indoor':
        return courtsWithPresence.filter(c =>
          c.categories?.some(cat => cat.toLowerCase().includes('indoor'))
        );
      case 'outdoor':
        return courtsWithPresence.filter(c =>
          c.categories?.some(cat => cat.toLowerCase().includes('outdoor')) ||
          !c.categories?.some(cat => cat.toLowerCase().includes('indoor'))
        );
      default:
        return courtsWithPresence;
    }
  }, [courtsWithPresence, selectedFilter, favoriteIds]);

  // Calculate live activity stats
  const liveStats = useMemo(() => {
    const courtsWithPlayers = courtsWithPresence.filter(
      c => c.onlineUsers && c.onlineUsers.length > 0
    );
    const totalPlayers = courtsWithPresence.reduce(
      (sum, c) => sum + (c.onlineUsers?.length || 0),
      0
    );
    return {
      activeCourts: courtsWithPlayers.length,
      totalPlayers,
      topCourt: courtsWithPlayers.sort(
        (a, b) => (b.onlineUsers?.length || 0) - (a.onlineUsers?.length || 0)
      )[0],
    };
  }, [courtsWithPresence]);

  // Get popular courts sorted by activity then distance
  const popularCourts = useMemo(() => {
    return [...courtsWithPresence]
      .sort((a, b) => {
        const aPlayers = a.onlineUsers?.length || 0;
        const bPlayers = b.onlineUsers?.length || 0;
        if (bPlayers !== aPlayers) return bPlayers - aPlayers;
        return (a.distance || 999) - (b.distance || 999);
      })
      .slice(0, 12);
  }, [courtsWithPresence]);

  // Create cycled data for infinite scroll effect
  const courtsListRef = useRef<FlatList>(null);

  const cycledCourts = useMemo(() => {
    const sourceCourts = selectedFilter !== 'all' ? filteredCourts : popularCourts;
    if (sourceCourts.length < 2) return sourceCourts;
    // Duplicate the data 3 times for seamless looping
    return [...sourceCourts, ...sourceCourts, ...sourceCourts].map((court, index) => ({
      ...court,
      _uniqueKey: `${court.id}-${index}`,
    }));
  }, [filteredCourts, popularCourts, selectedFilter]);

  // Handle reaching end of list - scroll back to middle set
  const handleScrollEndReached = useCallback(() => {
    const sourceCourts = selectedFilter !== 'all' ? filteredCourts : popularCourts;
    if (sourceCourts.length < 2 || !courtsListRef.current) return;
    // Scroll back to the middle set (index = length of original array)
    courtsListRef.current.scrollToIndex({
      index: sourceCourts.length,
      animated: false,
    });
  }, [filteredCourts, popularCourts, selectedFilter]);

  // Map court for navigation
  const mapCourtToPlace = (court: CourtWithPresence) => ({
    ...court,
    place_id: court.id,
    geometry: {
      location: {lat: court.lat, lng: court.lng},
    },
    isFavorite: isFavorite(court.id),
  });

  // Handle court press
  const handleCourtPress = (court: CourtWithPresence) => {
    const place = mapCourtToPlace(court);
    navigation.navigate('CourtDetails', {court: place});
  };

  // Handle favorite toggle
  const handleFavoriteToggle = async (courtId: string) => {
    await toggleFavorite(courtId);
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingTop: insets.top + spacing.sm, paddingBottom: 120},
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }>
        {/* Header with Personalized Greeting */}
        <View style={styles.header}>
          <Image
            source={images.HomeTitle}
            style={styles.logo}
            resizeMode="contain"
          />
          <PersonalizedGreeting />
        </View>

        {/* Live Court Activity Summary */}
        <View style={styles.activitySummary}>
          <Card variant="filled" padding="md" style={styles.activityCard}>
            <View style={styles.activityRow}>
              <View style={styles.activityStat}>
                <View style={[styles.statIconContainer, {backgroundColor: `${colors.info}20`}]}>
                  <UsersIcon color={colors.info} size={20} />
                </View>
                <View>
                  <Text variant="h2" style={{color: colors.info}}>
                    {liveStats.totalPlayers}
                  </Text>
                  <Text variant="caption" color="secondary">
                    Players Active
                  </Text>
                </View>
              </View>
              <View style={[styles.divider, {backgroundColor: colors.border}]} />
              <View style={styles.activityStat}>
                <View style={[styles.statIconContainer, {backgroundColor: `${colors.success}20`}]}>
                  <LocationIcon color={colors.success} size={20} />
                </View>
                <View>
                  <Text variant="h2" style={{color: colors.success}}>
                    {liveStats.activeCourts}
                  </Text>
                  <Text variant="caption" color="secondary">
                    Courts Active
                  </Text>
                </View>
              </View>
            </View>
            {liveStats.topCourt && (
              <TouchableOpacity
                style={[styles.hotspotBanner, {backgroundColor: `${colors.accent}15`}]}
                onPress={() => handleCourtPress(liveStats.topCourt!)}
                activeOpacity={0.7}>
                <View style={[styles.liveDot, {backgroundColor: colors.accent}]} />
                <Text variant="bodySmall" style={{flex: 1}}>
                  <Text variant="bodySmall" style={{fontWeight: '600'}}>
                    {liveStats.topCourt.name}
                  </Text>
                  {' '}is the hotspot with {liveStats.topCourt.onlineUsers?.length} players!
                </Text>
              </TouchableOpacity>
            )}
          </Card>
        </View>

        {/* Filter Chips */}
        <View style={styles.filtersContainer}>
          <FilterChips
            options={FILTER_OPTIONS.map(o => o.label)}
            selectedOptions={[FILTER_OPTIONS.find(o => o.id === selectedFilter)?.label || 'All']}
            onSelect={(label) => {
              const option = FILTER_OPTIONS.find(o => o.label === label);
              setSelectedFilter(option?.id || 'all');
            }}
          />
        </View>

        {/* Popular Near You - Main Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="h3">Popular Near You</Text>
            <Text variant="bodySmall" color="tertiary">
              {courtsWithPresence.length} courts
            </Text>
          </View>
          <FlatList
            ref={courtsListRef}
            horizontal
            data={cycledCourts}
            keyExtractor={(court: any) => court._uniqueKey || court.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.courtsList}
            initialScrollIndex={
              cycledCourts.length > 2
                ? Math.floor(cycledCourts.length / 3)
                : 0
            }
            getItemLayout={(_, index) => ({
              length: 225 + 16, // card width + margin
              offset: (225 + 16) * index,
              index,
            })}
            onEndReached={handleScrollEndReached}
            onEndReachedThreshold={0.2}
            renderItem={({item: court}) => (
              <CourtCard
                court={court}
                variant="tall"
                onPress={() => handleCourtPress(court)}
                onFavorite={() => handleFavoriteToggle(court.id)}
                isFavorite={isFavorite(court.id)}
                style={styles.courtCard}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyList}>
                <Text variant="body" color="tertiary">
                  No courts match your filter
                </Text>
              </View>
            }
          />
        </View>

        {/* Activity Ticker */}
        <ActivityTicker
          activities={recentActivities}
          onActivityPress={handleActivityPress}
        />

        {/* Leaderboard */}
        <View style={styles.leaderboardSection}>
          <Leaderboard
            onUserPress={(userId) => {
              navigation.navigate('UserProfile', {userId});
            }}
          />
        </View>

        {/* Empty State */}
        {!loading && courtsWithPresence.length === 0 && (
          <View style={styles.emptyState}>
            <Text variant="h3" color="secondary" style={styles.emptyText}>
              No courts found nearby
            </Text>
            <Text variant="body" color="tertiary" style={styles.emptySubtext}>
              Try expanding your search radius or check back later
            </Text>
          </View>
        )}
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
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  logo: {
    height: 32,
    width: 150,
  },
  filtersContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  // Live Activity Summary
  activitySummary: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  activityCard: {
    width: '100%',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  activityStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    width: 1,
    height: 40,
  },
  hotspotBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  // Courts Section
  section: {
    flex: 1,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  courtsList: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  courtCard: {
    marginRight: spacing.md,
  },
  emptyList: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    textAlign: 'center',
  },
  leaderboardSection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
});

export default Home;
