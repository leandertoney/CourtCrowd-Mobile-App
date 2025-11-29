import {StyleSheet, TextInputProps, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import {colors, fonts} from '../../utilities/theme';

interface Props {
  onPress?: () => void;
}
const PopularSearchItem: React.FC<Props> = ({onPress}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.title}>Buchmiller Park</Text>
      <Text style={styles.subTitle}>1 Results</Text>
    </TouchableOpacity>
  );
};

export default PopularSearchItem;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.blackLight,
    borderBottomColor: 'gray',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
    marginHorizontal: 12,
  },
  title: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fonts.ReadexMedium,
  },
  subTitle: {
    fontSize: 10,
    fontFamily: fonts.ReadexMedium,
    color: '#7A7A7A',
  },
});
