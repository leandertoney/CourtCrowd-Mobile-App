import {
  StyleSheet,
  TextInputProps,
  Text,
  View,
  Image,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import React from 'react';
import {colors, fonts} from '../../utilities/theme';

interface Props extends TextInputProps {
  title?: string;
  body?: string;
  time?: string;
  isCount?: boolean;
  image?: string;
  onPress?: () => void;
  containerStyle?: ViewStyle;
}

const ChatItem: React.FC<Props> = ({
  isCount,
  title,
  body,
  image,
  time,
  onPress,
  containerStyle,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, containerStyle]}
      onPress={onPress}>
      <Image source={{uri: image}} style={styles.imgStyle} />
      <View style={styles.innerContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subTitle}>{body}</Text>
      </View>
      <View>
        <Text style={[styles.time, !isCount && {marginBottom: 14}]}>
          {time}
        </Text>
        {isCount ? (
          <View style={styles.notificationContainer}>
            <Text style={styles.notificationCount}>5</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

export default ChatItem;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 6,
  },
  imgStyle: {width: 42, height: 42, borderRadius: 32},
  innerContainer: {
    marginLeft: 16,
    marginRight: 6,
    flex: 1,
  },
  title: {color: 'white', fontFamily: fonts.ReadexBold, fontSize: 14},
  subTitle: {
    fontSize: 11,
    fontFamily: fonts.ReadexBold,
    color: '#9A9BB1',
  },
  time: {
    fontSize: 12,
    fontFamily: fonts.ReadexBold,
    color: '#686A8A',
  },
  notificationContainer: {
    backgroundColor: '#E44057',
    width: 16,
    height: 18,
    borderRadius: 4,
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  notificationCount: {
    fontSize: 12,
    fontFamily: fonts.ReadexBold,
    color: colors.white,
  },
});
