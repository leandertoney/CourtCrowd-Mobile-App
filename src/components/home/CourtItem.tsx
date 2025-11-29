import {
  StyleSheet,
  TextInputProps,
  Text,
  TouchableOpacity,
  ImageBackground,
  ViewStyle,
} from 'react-native';
import React, {useMemo} from 'react';
import {images} from '../../assets/images';
import {colors, fonts} from '../../utilities/theme';
import {HeartFill, HeartUnfill} from '../../assets/svg';
import {IPlace} from '../../interfaces/IPlace';

// Note: Google Places photo URLs will be replaced with Supabase storage URLs after full migration

interface Props extends TextInputProps {
  onPress?: () => void;
  containerStyle?: ViewStyle;
  court: IPlace;
  isLiked?: boolean;
  onLike?: () => void;
  onDislike?: () => void;
}

const CourtItem: React.FC<Props> = ({
  court,
  isLiked,
  onPress,
  onLike,
  onDislike,
  containerStyle,
}) => {
  const photos = useMemo(() => {
    // TODO: Replace with court.photo_url from Supabase after migration
    if (!court.photos) return [undefined];
    return court.photos?.map(p => p.photo_reference);
  }, [court]);

  return (
    <TouchableOpacity
      style={[styles.container, containerStyle]}
      onPress={onPress}>
      <ImageBackground
        source={{
          uri:
            photos[0] ||
            'https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM=',
        }}
        style={styles.imgStyle}>
        <TouchableOpacity
          onPress={isLiked ? onDislike : onLike}
          style={{position: 'absolute', top: 6, right: 6}}>
          {isLiked ? <HeartFill /> : <HeartUnfill />}
        </TouchableOpacity>
      </ImageBackground>
      <Text style={styles.numberStyle}>{court.distance?.toFixed(2)} mi</Text>
      <Text style={styles.titleStyle}>{court.name}</Text>
      <Text style={styles.crowdText}>
        Crowd{' '}
        <Text style={styles.pplText}>{court.onlineUsers?.length || 0} ppl</Text>
      </Text>
    </TouchableOpacity>
  );
};

export default CourtItem;

const styles = StyleSheet.create({
  container: {
    width: '48%',
    paddingBottom: 6,
    borderRadius: 16,
    backgroundColor: colors.blackLight,
    overflow: 'hidden',
    marginTop: 20,
  },
  imgStyle: {
    height: 189,
    width: '100%',
  },
  numberStyle: {
    fontSize: 11,
    fontFamily: fonts.ReadexRegular,
    color: '#6C6C6C',
    marginTop: 5,
    marginLeft: 6,
  },
  titleStyle: {
    fontSize: 14,
    fontFamily: fonts.ReadexRegular,
    color: colors.white,
    marginLeft: 6,
  },
  crowdText: {
    fontSize: 12,
    fontFamily: fonts.ReadexRegular,
    color: colors.primary,
    marginLeft: 6,
  },
  pplText: {
    fontSize: 11,
    fontFamily: fonts.ReadexRegular,
    color: '#6C6C6C',
    marginLeft: 4,
  },
});
