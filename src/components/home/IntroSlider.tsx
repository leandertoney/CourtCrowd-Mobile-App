import {
  StyleSheet,
  TextInputProps,
  View,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import React, {useState} from 'react';
import AppIntroSlider from 'react-native-app-intro-slider';
import {colors} from '../../utilities/theme';
import {BackArrow, HeartFill, HeartFill2, HeartUnfill} from '../../assets/svg';
import {images} from '../../assets/images';

interface Props extends TextInputProps {
  onPressBack?: () => void;
  photos: string[];
  isFavorite?: boolean;
  onLike?: () => void;
  onDislike?: () => void;
}

const products = [
  {id: 1, image: images.Courtimg1},
  {id: 2, image: images.Courtimg2},
  {id: 3, image: images.Courtimg1},
];

const IntroSlider: React.FC<Props> = ({
  onPressBack,
  photos,
  isFavorite,
  onLike,
  onDislike,
}) => {
  return (
    <View style={{height: 410, marginBottom: -30}} pointerEvents="box-none">
      <AppIntroSlider
        data={photos}
        showDoneButton={false}
        showNextButton={false}
        dotStyle={{backgroundColor: '#D6DADB'}}
        activeDotStyle={{backgroundColor: colors.primary}}
        renderItem={({item}) => (
          <View style={{height: 350}}>
            <Image
              style={styles.image}
              source={{uri: item}}
              resizeMode="cover"
            />
          </View>
        )}
      />
      <TouchableOpacity
        activeOpacity={0.5}
        style={styles.iconContainer}
        onPress={isFavorite ? onDislike : onLike}
        hitSlop={8}>
        {isFavorite ? (
          <HeartFill2 width={20} height={20} fill={'#E44057'} />
        ) : (
          <HeartFill2 width={20} height={20} fill={'#ffffff'} />
        )}
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.5}
        style={[styles.iconContainer, {left: 20}]}
        onPress={onPressBack}
        hitSlop={8}>
        <BackArrow />
      </TouchableOpacity>
    </View>
  );
};

export default IntroSlider;

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heartButton: {
    width: 36,
    height: 36,
    borderRadius: 25,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 13,
    top: 50,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 25,
    backgroundColor: '#00000050',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 13,
    top: Platform.OS === 'android' ? 20 : 60,
  },
});
