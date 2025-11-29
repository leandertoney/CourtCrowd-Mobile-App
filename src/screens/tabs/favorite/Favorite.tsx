import {StyleSheet, View, FlatList} from 'react-native';
import React, {useEffect, useState, useCallback} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamsList} from '../../../navigation/HomeNavigation';
import {BottomTabParamlist} from '../../../navigation/BottomNavigation';
import {colors} from '../../../utilities/theme';
import {
  EmptyView,
  FavoriteItem,
  LoadingView,
  SearchBar,
} from '../../../components';
import {supabase} from '../../../lib/supabase';
import {useFavorites, CourtWithDistance} from '../../../hooks/useCourts';
import {getCurrentLocation, getDistanceMiles} from '../../../services/location';

type Props = NativeStackScreenProps<
  BottomTabParamlist & HomeStackParamsList,
  'Favorite'
>;

const Favorite: React.FC<Props> = ({navigation}) => {
  const {favoriteIds, toggleFavorite} = useFavorites();
  const [loading, setLoading] = useState(true);
  const [favoriteCourts, setFavoriteCourts] = useState<CourtWithDistance[]>([]);
  const [searchString, setSearchString] = useState('');
  const [filteredCourts, setFilteredCourts] = useState<CourtWithDistance[]>([]);

  const loadFavoriteCourts = useCallback(async () => {
    try {
      setLoading(true);

      if (favoriteIds.size === 0) {
        setFavoriteCourts([]);
        setFilteredCourts([]);
        return;
      }

      const courtIds = Array.from(favoriteIds);

      const {data, error} = await supabase
        .from('courts')
        .select('*')
        .in('id', courtIds);

      if (error) throw error;

      // Get current location for distance calculation
      const location = await getCurrentLocation();

      const courtsWithDistance: CourtWithDistance[] = (data || []).map(
        court => ({
          ...court,
          distance: location
            ? getDistanceMiles(
                location.coords.latitude,
                location.coords.longitude,
                court.lat,
                court.lng,
              )
            : null,
        }),
      );

      // Sort by distance
      courtsWithDistance.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });

      setFavoriteCourts(courtsWithDistance);
      setFilteredCourts(courtsWithDistance);
    } catch (error) {
      console.error('Error loading favorite courts:', error);
    } finally {
      setLoading(false);
    }
  }, [favoriteIds]);

  useEffect(() => {
    loadFavoriteCourts();
  }, [loadFavoriteCourts]);

  const handleSearch = (query: string) => {
    setSearchString(query);
    if (!query.trim()) {
      setFilteredCourts(favoriteCourts);
      return;
    }

    const filtered = favoriteCourts.filter(
      court =>
        court.name.toLowerCase().includes(query.toLowerCase()) ||
        (court.address && court.address.toLowerCase().includes(query.toLowerCase())),
    );
    setFilteredCourts(filtered);
  };

  const handleDislike = async (court: CourtWithDistance) => {
    await toggleFavorite(court.id);
    // Remove from local state immediately for better UX
    setFavoriteCourts(prev => prev.filter(c => c.id !== court.id));
    setFilteredCourts(prev => prev.filter(c => c.id !== court.id));
  };

  // Map court data to IPlace-like structure for compatibility
  const mapCourtToPlace = (court: CourtWithDistance) => ({
    ...court,
    place_id: court.id,
    geometry: {
      location: {lat: court.lat, lng: court.lng},
    },
    isFavorite: true,
  });

  return (
    <View style={styles.container}>
      <SearchBar
        placeholder="Search"
        value={searchString}
        onChangeText={handleSearch}
        containerStyle={styles.searchContainerStyle}
      />

      <FlatList
        numColumns={2}
        columnWrapperStyle={{gap: 12}}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 130}}
        data={filteredCourts}
        keyExtractor={item => item.id}
        ListEmptyComponent={() =>
          loading ? <LoadingView /> : <EmptyView message="No favorites yet" />
        }
        renderItem={({item}) => {
          const place = mapCourtToPlace(item);
          return (
            <FavoriteItem
              place={place}
              onPress={() => navigation.navigate('CourtDetails', {court: place})}
              onDislike={() => handleDislike(item)}
            />
          );
        }}
      />
    </View>
  );
};

export default Favorite;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
    paddingHorizontal: 20,
  },
  headerStyle: {
    fontSize: 22,
    textAlign: 'center',
  },
  searchContainerStyle: {
    marginTop: 0,
    marginBottom: 12,
  },
});
