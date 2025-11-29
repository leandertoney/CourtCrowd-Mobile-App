import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  Linking,
  Platform,
} from 'react-native';
import {HomeStackParamsList} from '../../../navigation/HomeNavigation';
import {BottomTabParamlist} from '../../../navigation/BottomNavigation';
import {colors, fonts} from '../../../utilities/theme';
import {CustomerReviews, IntroSlider, ReviewItem} from '../../../components';
import {
  ChatIcon,
  DistanceIcon,
  GoButton,
  StarIcon,
} from '../../../assets/svg';
import {supabase} from '../../../lib/supabase';
import {useFavorites} from '../../../hooks/useCourts';
import {useCourtPresence} from '../../../hooks/useCourtPresence';

type Props = NativeStackScreenProps<
  BottomTabParamlist & HomeStackParamsList,
  'CourtDetails'
>;

interface CourtUser {
  id: string;
  avatar_url: string | null;
  name: string | null;
  rating?: number;
}

const CourtDetails: React.FC<Props> = ({navigation, route}) => {
  const court = route.params.court;
  const courtId = court.id || court.place_id;
  const {toggleFavorite, isFavorite} = useFavorites();
  const {users: presenceUsers} = useCourtPresence(courtId);

  const [courtDetail, setCourtDetail] = useState(court);
  const [loading, setLoading] = useState(true);
  const [userPhotos, setUserPhotos] = useState<CourtUser[]>([]);

  useEffect(() => {
    fetchCourtDetail();
  }, []);

  const fetchCourtDetail = async () => {
    try {
      // Fetch court details from Supabase
      const {data, error} = await supabase
        .from('courts')
        .select('*')
        .eq('id', courtId)
        .single();

      if (error) throw error;

      if (data) {
        setCourtDetail({
          ...court,
          ...data,
          description: data.description || court.description,
        });
      }
    } catch (error) {
      console.error('Error fetching court details:', error);
    } finally {
      setLoading(false);
    }
  };

  const openMap = () => {
    const lat = courtDetail.lat || courtDetail.geometry?.location?.lat;
    const lng = courtDetail.lng || courtDetail.geometry?.location?.lng;
    const latLng = `${lat},${lng}`;
    const label = courtDetail.name || 'Court Location';

    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latLng}`,
      android: `geo:0,0?q=${latLng}(${label})`,
    });

    if (url) Linking.openURL(url);
  };

  // Use court photo_url from Supabase, fallback to old photos structure
  const photos = useMemo(() => {
    if (courtDetail.photo_url) {
      return [courtDetail.photo_url];
    }
    if (courtDetail.photos && Array.isArray(courtDetail.photos)) {
      return courtDetail.photos.map((p: any) => p.photo_reference || p);
    }
    return [
      'https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM=',
    ];
  }, [courtDetail]);

  const onLike = async () => {
    await toggleFavorite(courtId);
  };

  const onDislike = async () => {
    await toggleFavorite(courtId);
  };

  // Calculate live rating from presence users
  const liveRating = useMemo(() => {
    const usersWithRating = presenceUsers.filter(u => u.rating);
    if (!usersWithRating.length) return 0;

    const total = usersWithRating.reduce((sum, user) => sum + (user.rating || 0), 0);
    return parseFloat((total / usersWithRating.length).toFixed(1));
  }, [presenceUsers]);

  // Load user photos from presence data
  useEffect(() => {
    const loadOnlineUsersPhotos = async () => {
      try {
        if (!presenceUsers.length) {
          setUserPhotos([]);
          return;
        }

        const userIds = presenceUsers.map(u => u.user_id);

        const {data, error} = await supabase
          .from('profiles')
          .select('id, avatar_url, name')
          .in('id', userIds);

        if (error) throw error;

        setUserPhotos(data || []);
      } catch (error) {
        console.error('Failed to fetch user photos:', error);
      }
    };

    loadOnlineUsersPhotos();
  }, [presenceUsers]);

  const handleChatPress = async () => {
    navigation.navigate('ChatDetail', {groupId: courtId});
  };

  return (
    <View style={{flex: 1, backgroundColor: colors.black}}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <IntroSlider
          isFavorite={isFavorite(courtId)}
          photos={photos}
          onPressBack={() => navigation.goBack()}
          onLike={onLike}
          onDislike={onDislike}
        />
        <View style={styles.ratingRow}>
          <StarIcon />
          <Text style={styles.ratingText}>
            {(courtDetail.rating || court.rating || 0).toFixed(1)}
          </Text>
        </View>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{courtDetail.name || court.name}</Text>
          <TouchableOpacity onPress={handleChatPress}>
            <ChatIcon />
          </TouchableOpacity>
        </View>
        <View style={styles.ratingRow}>
          <DistanceIcon />
          <Text style={styles.distance}>
            {court.distance ? court.distance.toFixed(2) : 0} miles Away
          </Text>
        </View>
        <Text style={styles.profeatureStyle}>PRO FEATURE</Text>

        <View style={styles.containerRow}>
          <View style={styles.rowContainer}>
            <Text style={[styles.containerText, {color: colors.orange}]}>
              Live Rating
            </Text>
            <Text
              style={[
                styles.containerText,
                {fontSize: 14, color: colors.orange},
              ]}>
              {liveRating.toFixed(1)}
            </Text>
          </View>
        </View>

        <Text style={styles.discriptionTitle}>Description</Text>
        <Text style={styles.discription}>
          {courtDetail.description ||
            courtDetail.editorial_summary?.overview ||
            'No description added yet'}
        </Text>
        <View style={styles.ratingRow}>
          <Text style={styles.crowdStyle}>
            Crowd{' '}
            <Text style={{color: colors.primary}}>{presenceUsers.length}</Text>
          </Text>
          <Text style={[styles.profeatureStyle, {marginHorizontal: 0}]}>
            PRO FEATURE
          </Text>
        </View>

        {userPhotos.length ? (
          <FlatList
            data={userPhotos}
            horizontal
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <Image
                source={{
                  uri:
                    item.avatar_url ||
                    'https://randomuser.me/api/portraits/men/72.jpg',
                }}
                style={styles.imgStyle}
              />
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              gap: 12,
            }}
          />
        ) : (
          <View style={styles.photoLoadingContainer}>
            <Text style={styles.discription}>No Crowd available</Text>
          </View>
        )}
        <View style={[styles.titleRow, {alignItems: 'center', marginTop: 28}]}>
          <Text style={styles.review}>Reviews</Text>
        </View>
        <CustomerReviews
          userTotalRatings={courtDetail.user_ratings_total || court.user_ratings_total || 0}
          rating={courtDetail.rating || court.rating || 0}
          reviews={courtDetail.reviews || []}
        />
        <Text style={[styles.review, {marginHorizontal: 20, marginTop: 20}]}>
          Recent Reviews
        </Text>

        <FlatList
          data={courtDetail.reviews || []}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => (
            <ReviewItem
              name={item.author_name}
              comment={item.text}
              Url={item.profile_photo_url}
              rating={item.rating}
              time={item.time}
            />
          )}
          ListEmptyComponent={() => (
            <Text style={[styles.discription, {textAlign: 'center', marginTop: 12}]}>
              No reviews yet
            </Text>
          )}
        />
      </ScrollView>
      <View style={styles.bottomRow}>
        <Text style={styles.bottomText}>
          {court.distance ? court.distance.toFixed(2) : 0}
          <Text style={styles.distance}>/mi</Text>
        </Text>
        <TouchableOpacity onPress={openMap}>
          <GoButton />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  imgStyle: {
    width: 80,
    height: 80,
    borderRadius: 18,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginHorizontal: 20,
  },
  ratingText: {
    fontSize: 16,
    fontFamily: fonts.ReadexRegular,
    color: '#7A7A7A',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
  },
  review: {
    marginHorizontal: 0,
    fontSize: 20,
    fontFamily: fonts.ReadexSemiBold,
    color: colors.white,
  },
  discriptionTitle: {
    fontSize: 16,
    fontFamily: fonts.ReadexSemiBold,
    color: colors.white,
    marginHorizontal: 20,
    marginTop: 18,
  },
  bottomText: {
    fontSize: 24,
    fontFamily: fonts.ReadexMedium,
    color: colors.white,
  },
  bottomRow: {
    height: 80,
    backgroundColor: colors.blackLight,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    flexDirection: 'row',
  },
  discription: {
    fontSize: 14,
    fontFamily: fonts.ReadexRegular,
    color: '#7A7A7A',
    marginHorizontal: 20,
    marginTop: 8,
    width: '83%',
    lineHeight: 17.5,
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.ReadexMedium,
    color: colors.white,
    width: '60%',
  },
  distance: {
    fontSize: 12,
    fontFamily: fonts.ReadexMedium,
    color: colors.white,
  },
  containerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 12,
  },
  crowdStyle: {
    fontSize: 20,
    fontFamily: fonts.ReadexSemiBold,
    color: colors.white,
    marginRight: 4,
    marginTop: 22,
    marginBottom: 10,
  },
  rowContainer: {
    width: 99,
    height: 72,
    backgroundColor: `${colors.primary}30`,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerText: {
    fontSize: 12,
    fontFamily: fonts.ReadexRegular,
    color: colors.white,
  },
  profeatureStyle: {
    fontSize: 10,
    fontFamily: fonts.ReadexBold,
    color: colors.primary,
    marginHorizontal: 20,
    marginTop: 13,
    textDecorationLine: 'underline',
  },
  photoLoadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CourtDetails;
