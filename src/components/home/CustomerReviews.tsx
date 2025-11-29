import {StyleSheet, Text, View, Dimensions} from 'react-native';
import React, {useMemo} from 'react';
import {StarIcon, StarIcon2} from '../../assets/svg';
import {colors, fonts} from '../../utilities/theme';
import * as Progress from 'react-native-progress';
import {IReview} from '../../interfaces/IPlace';

interface Props {
  rating: number;
  userTotalRatings?: number;
  reviews?: IReview[];
}

const CustomerReviews: React.FC<Props> = ({
  rating,
  userTotalRatings,
  reviews,
}) => {
  const {width} = Dimensions.get('window');

  const starCounts = useMemo(() => {
    const starCounts: { [key: string]: number } = {
      '5': 0,
      '4': 0,
      '3': 0,
      '2': 0,
      '1': 0,
    };

    reviews?.forEach(review => {
      const rating = review.rating;

      if (rating >= 1 && rating <= 5) {
        starCounts[String(rating)]++;
      }
    });

    return starCounts;
  }, [reviews]);

  return (
    <View style={{marginHorizontal: 20}}>
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
        <Text style={styles.count}>{rating}</Text>
        <View>
          <Text style={styles.totalReview}>
            Total : {userTotalRatings || 0} Reviews
          </Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {new Array(5)
              .fill('*')
              .map((_, index) =>
                rating && Math.round(rating) >= index + 1 ? (
                  <StarIcon key={index} width={16} height={16} />
                ) : (
                  <StarIcon2 key={index} width={16} height={16} />
                ),
              )}
          </View>
        </View>
      </View>
      {reviews?.length &&
        Object.entries(starCounts)
          .reverse()
          .map(([key, value]) => {
            return (
              <View key={key} style={styles.progressRow}>
                <Progress.Bar
                  progress={(value * 100) / reviews?.length}
                  width={width * 0.75}
                  height={10}
                  color="#CAFF00"
                  unfilledColor="#ffffff"
                  borderWidth={0}
                />
                <Text style={styles.text}>{key} Star</Text>
              </View>
            );
          })}
      {/* <View style={styles.progressRow}>
        <Progress.Bar
          progress={0.6}
          width={width * 0.75}
          height={10}
          color="#CAFF00"
          unfilledColor="#ffffff"
          borderWidth={0}
        />
        <Text style={styles.text}>4 Star</Text>
      </View>
      <View style={styles.progressRow}>
        <Progress.Bar
          progress={0.5}
          width={width * 0.75}
          height={10}
          color="#CAFF00"
          unfilledColor="#ffffff"
          borderWidth={0}
        />
        <Text style={styles.text}>3 Star</Text>
      </View>
      <View style={styles.progressRow}>
        <Progress.Bar
          progress={0.4}
          width={width * 0.75}
          height={10}
          color="#CAFF00"
          unfilledColor="#ffffff"
          borderWidth={0}
        />
        <Text style={styles.text}>2 Star</Text>
      </View>
      <View style={styles.progressRow}>
        <Progress.Bar
          progress={0.3}
          width={width * 0.75}
          height={10}
          color="#CAFF00"
          unfilledColor="#ffffff"
          borderWidth={0}
        />
        <Text style={styles.text}>1 Star</Text>
      </View> */}
    </View>
  );
};

export default CustomerReviews;

const styles = StyleSheet.create({
  cusomerReviews: {
    fontSize: 16,
    fontFamily: fonts.ReadexMedium,
    color: colors.black,
    marginTop: 12,
  },
  totalReview: {
    fontSize: 14,
    fontFamily: fonts.ReadexRegular,
    color: '#7A7A7A',
  },
  starContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  count: {
    fontSize: 48,
    fontFamily: fonts.ReadexSemiBold,
    color: colors.white,
  },
  text: {
    color: colors.white,
    fontFamily: fonts.ReadexRegular,
    fontSize: 12,
  },
  titleStyle: {
    fontSize: 12,
    fontFamily: fonts.ReadexMedium,
    color: colors.white,
  },
});
