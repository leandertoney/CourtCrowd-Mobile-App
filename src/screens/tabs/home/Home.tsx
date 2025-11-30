import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Platform,
  SafeAreaView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamsList} from '../../../navigation/HomeNavigation';
import {BottomTabParamlist} from '../../../navigation/BottomNavigation';
import {colors, fonts} from '../../../utilities/theme';
import {images} from '../../../assets/images';
import {supabase} from '../../../lib/supabase';

import {
  CourtItem,
  EmptyView,
  LoadingView,
  SearchBar,
} from '../../../components';
import {
  GalleryIcon,
  GalleryIcon2,
  LocationIcon,
  LocationIcon2,
} from '../../../assets/svg';

import {useCourts, useFavorites, CourtWithDistance} from '../../../hooks/useCourts';
import {useAppSelector} from '../../../store';
import {CourtMapView} from '../../../components/CourtMapView';
import {PresenceUser} from '../../../hooks/useCourtPresence';

type Props = NativeStackScreenProps<
  BottomTabParamlist & HomeStackParamsList,
  'Home'
>;

const Home: React.FC<Props> = ({navigation}) => {
  const {courts, loading, refetch} = useCourts();
  const {toggleFavorite, isFavorite} = useFavorites();

  const [isSearched, setIsSearched] = useState<boolean>(false);
  const [searchString, setSearchString] = useState('');
  const [filteredCourts, setFilteredCourts] = useState<CourtWithDistance[]>([]);
  const [screenMode, setScreenMode] = useState<'default' | 'gallery' | 'location'>('gallery');

  const {currentLocation} = useAppSelector(state => state.auth);
  const user = useAppSelector(state => state.auth.user);

  // Update filtered courts when courts change
  useEffect(() => {
    setFilteredCourts(courts);
  }, [courts]);

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

  const handleSearch = async (query?: string) => {
    const text = (query || searchString).toLowerCase().trim();

    if (!text) {
      setFilteredCourts(courts);
      setIsSearched(false);
      return;
    }

    setIsSearched(true);

    // Filter courts locally by name or address
    const filtered = courts.filter(
      court =>
        court.name.toLowerCase().includes(text) ||
        (court.address && court.address.toLowerCase().includes(text)),
    );

    setFilteredCourts(filtered);
  };

  const handleLike = async (court: CourtWithDistance) => {
    await toggleFavorite(court.id);
  };

  const handleDislike = async (court: CourtWithDistance) => {
    await toggleFavorite(court.id);
  };

  // Map court data to IPlace-like structure for compatibility
  const mapCourtToPlace = (court: CourtWithDistance) => ({
    ...court,
    place_id: court.id,
    geometry: {
      location: {lat: court.lat, lng: court.lng},
    },
    isFavorite: isFavorite(court.id),
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={{paddingHorizontal: 12}}>
        <View style={[styles.headerRow, {marginTop: 20}]}>
          <Image source={images.HomeTitle} style={styles.titleStyle} />
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Image
              source={{
                uri: user?.photo?.url || 'https://randomuser.me/api/portraits/men/72.jpg',
              }}
              style={[styles.profileStyle, {borderWidth: 2}]}
            />
          </TouchableOpacity>
        </View>
        <SearchBar
          placeholder="Search Nearby Court"
          value={searchString}
          onChangeText={text => setSearchString(text)}
          onEndEditing={() => handleSearch()}
          containerStyle={{marginTop: 26}}
          returnKeyLabel="search"
        />
      </View>
      {isSearched ? (
        <View style={{paddingHorizontal: 20}}>
          <Text style={styles.searchResult}>Search Results</Text>
          <Text style={styles.showResult}>
            Showing {filteredCourts.length} Results
          </Text>

          <FlatList
            numColumns={2}
            columnWrapperStyle={{justifyContent: 'space-between'}}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: Platform.OS === 'android' ? 162 : 340,
            }}
            data={filteredCourts}
            keyExtractor={item => item.id}
            ListEmptyComponent={() =>
              loading ? (
                <LoadingView />
              ) : (
                <EmptyView
                  message="No Result"
                  description="Please try different search query"
                />
              )
            }
            renderItem={({item}) => {
              const place = mapCourtToPlace(item);
              return (
                <CourtItem
                  court={place}
                  onPress={() =>
                    navigation.navigate('CourtDetails', {court: place})
                  }
                  isLiked={isFavorite(item.id)}
                  onLike={() => handleLike(item)}
                  onDislike={() => handleDislike(item)}
                />
              );
            }}
          />
        </View>
      ) : (
        <>
          {screenMode === 'gallery' ? (
            <View style={{paddingHorizontal: 20}}>
              <Text style={[styles.title, {marginLeft: 0}]}>Courts Nearby</Text>
              <FlatList
                numColumns={2}
                columnWrapperStyle={{justifyContent: 'space-between'}}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingBottom: Platform.OS === 'android' ? 162 : 340,
                }}
                data={filteredCourts}
                keyExtractor={item => item.id}
                ListEmptyComponent={() =>
                  loading ? (
                    <LoadingView />
                  ) : (
                    <EmptyView
                      message="No Result"
                      description="No court available. Try Searching..."
                    />
                  )
                }
                renderItem={({item}) => {
                  const place = mapCourtToPlace(item);
                  return (
                    <CourtItem
                      court={place}
                      onPress={() =>
                        navigation.navigate('CourtDetails', {court: place})
                      }
                      isLiked={isFavorite(item.id)}
                      onLike={() => handleLike(item)}
                      onDislike={() => handleDislike(item)}
                    />
                  );
                }}
              />
            </View>
          ) : (
            <CourtMapView
              courts={filteredCourts}
              onCourtPress={(court, users: PresenceUser[]) => {
                const place = mapCourtToPlace(court);
                navigation.navigate('CourtDetails', {court: place});
              }}
              initialLocation={currentLocation?.coords ? {
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
              } : null}
            />
          )}
        </>
      )}
      <View style={[styles.absoluteContainer, {bottom: isSearched ? 16 : 116}]}>
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => setScreenMode('gallery')}
          hitSlop={4}>
          {screenMode === 'gallery' ? <GalleryIcon /> : <GalleryIcon2 />}
        </TouchableOpacity>
        <View style={styles.lineStyle} />
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => setScreenMode('location')}
          hitSlop={4}>
          {screenMode === 'location' ? <LocationIcon2 /> : <LocationIcon />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 22,
  },
  titleStyle: {width: 200, height: 38},
  profileStyle: {
    width: 42,
    height: 42,
    borderRadius: 32,
    borderColor: colors.primary,
    borderWidth: 2,
  },

  title: {
    fontSize: 20,
    fontFamily: fonts.ReadexSemiBold,
    color: colors.white,
    marginTop: 24,
    marginLeft: 12,
  },
  showResult: {
    fontSize: 14,
    fontFamily: fonts.ReadexRegular,
    color: '#9E9E9E',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  searchResult: {
    fontSize: 20,
    fontFamily: fonts.ReadexSemiBold,
    color: colors.white,
    marginTop: 20,
  },
  lineStyle: {height: '80%', width: 1, backgroundColor: '#646464'},
  absoluteContainer: {
    width: 90,
    height: 32,
    backgroundColor: '#242323',
    position: 'absolute',
    right: 20,
    borderRadius: 24,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconContainer: {
    width: 45,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
