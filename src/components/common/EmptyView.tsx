import {View, Text, ActivityIndicator, StyleSheet} from 'react-native';
import React from 'react';
import {colors, fonts} from '../../utilities/theme';
import {EmptyFolder} from '../../assets/svg';

interface Props {
  message?: string;
  description?: string;
  icon?: React.ReactNode;
}

const EmptyView: React.FC<Props> = ({
  message = 'No content found...',
  description = 'Please login to view more updates',
  icon,
}) => {
  return (
    <View style={styles.container}>
      {icon ? icon : <EmptyFolder />}
      <Text style={styles.text}>{message}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
};

export default EmptyView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 48,
  },
  text: {
    marginTop: 30,
    color: colors.gray['400'],
    fontFamily: fonts.ReadexSemiBold,
    fontWeight: '600',
    fontSize: 10,
  },
  description: {
    marginTop: 8,
    color: colors.gray['400'],
    fontFamily: fonts.ReadexSemiBold,
    fontWeight: '400',
    fontSize: 7,
  },
});
