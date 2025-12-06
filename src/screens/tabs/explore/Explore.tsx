import React, {useState, useMemo, useCallback, useRef} from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import BottomSheet, {BottomSheetView, BottomSheetFlatList} from '@gorhom/bottom-sheet';
import {useColors} from '../../../contexts/ThemeContext';
import {spacing, borderRadius} from '../../../utilities/theme';
import Text from '../../../components/ui/Text';
import {FilterChips} from '../../../components/ui/Chip';
import {CourtCard} from '../../../components/courts';
import {CourtMapView} from '../../../components/CourtMapView';
import {useCourts, useFavorites, CourtWithDistance} from '../../../hooks/useCourts';
import {useCourtPresence, PresenceUser} from '../../../hooks/useCourtPresence';
import {useAppSelector} from '../../../store';
import Svg, {Path, Circle} from 'react-native-svg';

const {height: SCREEN_HEIGHT, width: SCREEN_WIDTH} = Dimensions.get('window');
const BOTTOM_SHEET_MIN_HEIGHT = 150;
const BOTTOM_SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.6;

// =============================================================================
// FILTER OPTIONS
// =============================================================================

const FILTER_OPTIONS = [
  {label: 'All', value: 'all'},
  {label: 'Indoor', value: 'indoor'},
  {label: 'Outdoor', value: 'outdoor'},
  {label: 'Nearby', value: 'nearby'},
  {label: 'Free', value: 'free'},
];

// =============================================================================
// ICONS
// =============================================================================

const SearchIcon: React.FC<{color: string; size?: number}> = ({color, size = 20}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" />
    <Path d="M21 21l-4.35-4.35" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const CloseIcon: React.FC<{color: string; size?: number}> = ({color, size = 20}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const ListIcon: React.FC<{color: string; size?: number}> = ({color, size = 24}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const MapPinIcon: React.FC<{color: string; size?: number}> = ({color, size = 24}) => (
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
// COURT WITH PRESENCE TYPE
// =============================================================================

interface CourtWithPresence extends CourtWithDistance {
  onlineUsers?: Array<{
    id: string;
    name?: string;
    photo?: string;
  }>;
}

// =============================================================================
// EXPLORE SCREEN
// =============================================================================

const Explore: React.FC = () => {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [bottomSheetIndex, setBottomSheetIndex] = useState(0);

  const searchInputRef = useRef<TextInput>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['18%', '50%', '85%'], []);

  // Data hooks
  const {courts, loading} = useCourts();
  const {toggleFavorite, isFavorite} = useFavorites();
  const {currentLocation} = useAppSelector(state => state.auth);

  // Get court IDs for presence
  const courtIds = useMemo(() => courts.map(c => c.id), [courts]);
  const {presence} = useCourtPresence(courtIds);

  // Merge courts with presence
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

  // Filter courts
  const filteredCourts = useMemo(() => {
    let result = courtsWithPresence;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        c =>
          c.name.toLowerCase().includes(query) ||
          c.address?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    switch (selectedFilter) {
      case 'nearby':
        result = result.filter(c => c.distance != null && c.distance <= 5);
        break;
      case 'indoor':
        result = result.filter(c =>
          c.categories?.some(cat => cat.toLowerCase().includes('indoor'))
        );
        break;
      case 'outdoor':
        result = result.filter(c =>
          c.categories?.some(cat => cat.toLowerCase().includes('outdoor')) ||
          !c.categories?.some(cat => cat.toLowerCase().includes('indoor'))
        );
        break;
      case 'free':
        result = result.filter(c =>
          c.categories?.some(cat => cat.toLowerCase().includes('free') || cat.toLowerCase().includes('public'))
        );
        break;
    }

    return result;
  }, [courtsWithPresence, searchQuery, selectedFilter]);

  // Map court for navigation
  const mapCourtToPlace = useCallback((court: CourtWithPresence) => ({
    ...court,
    place_id: court.id,
    geometry: {
      location: {lat: court.lat, lng: court.lng},
    },
    isFavorite: isFavorite(court.id),
  }), [isFavorite]);

  // Handle court press from map
  const handleCourtPress = useCallback((court: any, users: PresenceUser[]) => {
    const place = mapCourtToPlace(court);
    navigation.navigate('CourtDetails', {court: place});
  }, [mapCourtToPlace, navigation]);

  // Handle court press from list
  const handleListCourtPress = useCallback((court: CourtWithPresence) => {
    const place = mapCourtToPlace(court);
    navigation.navigate('CourtDetails', {court: place});
  }, [mapCourtToPlace, navigation]);

  // Handle bottom sheet change
  const handleSheetChange = useCallback((index: number) => {
    setBottomSheetIndex(index);
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    searchInputRef.current?.blur();
  }, []);

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, {paddingTop: insets.top + spacing.sm}]}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.surfaceLight,
              borderColor: isSearchFocused ? colors.accent : 'transparent',
            },
          ]}>
          <SearchIcon color={colors.text.tertiary} />
          <TextInput
            ref={searchInputRef}
            style={[styles.searchInput, {color: colors.text.primary}]}
            placeholder="Search courts..."
            placeholderTextColor={colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            returnKeyType="search"
            keyboardAppearance="dark"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <CloseIcon color={colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* View Toggle */}
        <TouchableOpacity
          style={[styles.viewToggle, {backgroundColor: colors.surfaceLight}]}
          onPress={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}>
          {viewMode === 'map' ? (
            <ListIcon color={colors.text.primary} />
          ) : (
            <MapPinIcon color={colors.text.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <FilterChips
          chips={FILTER_OPTIONS}
          selected={selectedFilter}
          onSelect={setSelectedFilter}
        />
      </View>

      {/* Results Count */}
      {searchQuery.length > 0 && (
        <View style={styles.resultsCount}>
          <Text variant="bodySmall" color="tertiary">
            {filteredCourts.length} {filteredCourts.length === 1 ? 'court' : 'courts'} found
          </Text>
        </View>
      )}

      {/* Map or List View */}
      {viewMode === 'map' ? (
        <View style={styles.mapContainer}>
          <CourtMapView
            courts={filteredCourts}
            onCourtPress={handleCourtPress}
            initialLocation={currentLocation?.coords ? {
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
            } : null}
          />

          {/* Bottom Sheet */}
          <BottomSheet
            ref={bottomSheetRef}
            index={0}
            snapPoints={snapPoints}
            onChange={handleSheetChange}
            enablePanDownToClose={false}
            backgroundStyle={{backgroundColor: colors.background}}
            handleIndicatorStyle={{backgroundColor: colors.surfaceLight, width: 40}}
            style={styles.bottomSheet}
          >
            <BottomSheetView style={styles.sheetHeader}>
              <Text variant="h4">
                {bottomSheetIndex > 0 ? 'Nearby Courts' : `${filteredCourts.length} Courts Nearby`}
              </Text>
              {bottomSheetIndex === 0 && (
                <Text variant="bodySmall" color="tertiary">
                  Pull up for list
                </Text>
              )}
            </BottomSheetView>

            <BottomSheetFlatList
              data={filteredCourts}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.sheetList}
              showsVerticalScrollIndicator={false}
              renderItem={({item}) => (
                <View style={styles.sheetListItem}>
                  <CourtCard
                    court={item}
                    variant="compact"
                    onPress={() => handleListCourtPress(item)}
                    onFavorite={() => toggleFavorite(item.id)}
                    isFavorite={isFavorite(item.id)}
                    style={{width: (SCREEN_WIDTH - spacing.md * 3) / 2}}
                  />
                </View>
              )}
              numColumns={2}
              columnWrapperStyle={styles.sheetListRow}
            />
          </BottomSheet>
        </View>
      ) : (
        <FlatList
          data={filteredCourts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, {paddingBottom: 120}]}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={styles.listRow}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text variant="h4" color="secondary" style={styles.emptyText}>
                {searchQuery ? 'No courts match your search' : 'No courts found'}
              </Text>
              <Text variant="body" color="tertiary">
                Try adjusting your filters or search
              </Text>
            </View>
          }
          renderItem={({item}) => (
            <CourtCard
              court={item}
              variant="default"
              onPress={() => handleListCourtPress(item)}
              onFavorite={() => toggleFavorite(item.id)}
              isFavorite={isFavorite(item.id)}
              style={{width: (SCREEN_WIDTH - spacing.md * 3) / 2}}
            />
          )}
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
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    borderWidth: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  viewToggle: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterContainer: {
    marginBottom: spacing.sm,
  },
  resultsCount: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  mapContainer: {
    flex: 1,
  },
  bottomSheet: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: -4},
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  sheetHeader: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  sheetList: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  sheetListItem: {
    marginBottom: spacing.md,
  },
  sheetListRow: {
    justifyContent: 'space-between',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  listRow: {
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    marginBottom: spacing.sm,
  },
});

export default Explore;
