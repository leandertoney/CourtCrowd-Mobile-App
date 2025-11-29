import {StyleSheet, TextInputProps, Text, View, Image} from 'react-native';
import React from 'react';
import {colors, fonts} from '../../utilities/theme';
import {StarIcon, StarIcon2} from '../../assets/svg';
import moment from 'moment';

interface Props extends TextInputProps {
  //   onPress?: () => void;
  name?: string;
  comment?: string;
  Url?: string;
  rating?: number;
  time?: number;
}

const ReviewItem: React.FC<Props> = ({name, comment, Url, rating, time}) => {
  return (
    <View style={styles.container}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Image
          source={{
            uri: Url,
          }}
          style={styles.imgStyle}
        />
        <View style={{flexDirection: 'column', marginLeft: 12}}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.starRow}>
            {new Array(5)
              .fill('*')
              .map((_, index) =>
                rating && rating >= index + 1 ? (
                  <StarIcon key={index} width={16} height={16} />
                ) : (
                  <StarIcon2 key={index} width={16} height={16} />
                ),
              )}

            <Text style={styles.dateStyle}>
              {time ? moment(time * 1000).format('MMMM YYYY') : ''}
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.comment}>{comment}</Text>
    </View>
  );
};

export default ReviewItem;

const styles = StyleSheet.create({
  container: {marginHorizontal: 20, marginTop: 25},
  imgStyle: {width: 42, height: 42, borderRadius: 100},
  name: {color: 'white', fontFamily: fonts.ReadexRegular, fontSize: 16},
  comment: {
    fontSize: 14,
    fontFamily: fonts.ReadexRegular,
    color: '#7A7A7A',
    marginTop: 10,
  },
  starRow: {flexDirection: 'row', alignItems: 'center'},
  dateStyle: {
    fontSize: 11,
    fontFamily: fonts.ReadexRegular,
    color: '#A6A6A6',
    marginLeft: 8,
  },
});
