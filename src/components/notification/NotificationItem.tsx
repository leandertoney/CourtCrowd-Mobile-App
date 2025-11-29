import {StyleSheet, TextInputProps, Text, View, Image} from 'react-native';
import React from 'react';
import {colors, fonts} from '../../utilities/theme';

interface Props extends TextInputProps {
  title?: string;
  suTitle?: string;
  image?: string;
  isActive?: boolean;
}

const NotificationItem: React.FC<Props> = ({
  title,
  suTitle,
  image,
  isActive,
}) => {
  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: image,
        }}
        style={styles.imgStyle}
      />
      <View style={{flexDirection: 'column'}}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subTitle}>{suTitle}</Text>
      </View>
      {isActive ? <View style={styles.dotStyle} /> : null}
    </View>
  );
};

export default NotificationItem;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.blackLight,
    borderRadius: 8,
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 16,
  },
  title: {
    fontSize: 14,
    fontFamily: fonts.ReadexSemiBold,
    color: colors.white,
  },
  imgStyle: {width: 56, height: 56, borderRadius: 32},
  subTitle: {
    fontSize: 12,
    fontFamily: fonts.ReadexMedium,
    color: colors.gray[50],
    width: '90%',
    lineHeight: 16,
  },
  dotStyle: {
    width: 9,
    height: 9,
    backgroundColor: colors.primary,
    borderRadius: 32,
    position: 'absolute',
    top: 4,
    right: 5,
  },
});
