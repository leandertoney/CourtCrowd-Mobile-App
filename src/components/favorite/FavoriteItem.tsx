import {
  StyleSheet,
  TextInputProps,
  Text,
  TouchableOpacity,
  ImageBackground,
  View,
  ViewStyle,
} from 'react-native';
import React, {useMemo} from 'react';
import {colors, fonts} from '../../utilities/theme';
import {HeartFill, HeartUnfill, PeopleIcon} from '../../assets/svg';
import {IPlace} from '../../interfaces/IPlace';

// Note: Google Places photo URLs will be replaced with Supabase storage URLs after full migration

interface Props extends TextInputProps {
  onPress?: () => void;
  containerStyle?: ViewStyle;
  place: IPlace;
  isLiked?: boolean;
  onDislike?: () => void;
}

const FavoriteItem: React.FC<Props> = ({
  containerStyle,
  place,
  onPress,
  onDislike,
}) => {
  const photos = useMemo(() => {
    // TODO: Replace with place.photo_url from Supabase after migration
    if (!place.photos) return [undefined];
    return place.photos?.map(p => p.photo_reference);
  }, [place]);

  return (
    <TouchableOpacity
      style={[styles.container, containerStyle]}
      onPress={onPress}>
      <ImageBackground source={{uri: photos[0]}} style={styles.imgStyle}>
        <TouchableOpacity
          onPress={onDislike}
          style={{position: 'absolute', top: 6, right: 6}}>
          <HeartFill />
        </TouchableOpacity>
      </ImageBackground>
      <View style={styles.titleRow}>
        <Text style={styles.titleStyle}>{place.name}</Text>
        <View style={styles.peopleRow}>
          <Text style={styles.count}>{12}</Text>
          <PeopleIcon />
        </View>
      </View>
      <Text style={styles.numberStyle}>
        {place.distance?.toFixed(2) || '--'} mi
      </Text>
    </TouchableOpacity>
  );
};

export default FavoriteItem;

const styles = StyleSheet.create({
  container: {
    width: '48%',
    borderRadius: 16,
    backgroundColor: colors.black,
    overflow: 'hidden',
    marginTop: 18,
  },
  imgStyle: {
    height: 114,
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  count: {
    fontSize: 10,
    fontFamily: fonts.ReadexRegular,
    color: colors.white,
    marginRight: 4,
  },
  peopleRow: {flexDirection: 'row', alignItems: 'center'},
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    justifyContent: 'space-between',
    marginHorizontal: 4,
  },
  numberStyle: {
    fontSize: 11,
    fontFamily: fonts.ReadexMedium,
    color: '#6C6C6C',
    marginLeft: 6,
  },
  titleStyle: {
    fontSize: 13,
    fontFamily: fonts.ReadexRegular,
    color: colors.white,
    width: '70%',
  },
});
