import {
  StyleSheet,
  TextInputProps,
  Text,
  ViewStyle,
  TouchableOpacity,
  TextStyle,
} from 'react-native';
import React, {ReactNode} from 'react';
import {colors, fonts} from '../../utilities/theme';

interface Props extends TextInputProps {
  icon?: ReactNode;
  title?: string;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  onPress?: () => void;
}

const ProfileItem: React.FC<Props> = ({
  icon,
  containerStyle,
  titleStyle,
  title,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, containerStyle]}
      onPress={onPress}>
      {icon}
      <Text style={[styles.titleStyle, titleStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

export default ProfileItem;

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    borderBottomColor: colors.gray[150],
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  titleStyle: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fonts.ReadexRegular,
    marginLeft: 13,
  },
});
