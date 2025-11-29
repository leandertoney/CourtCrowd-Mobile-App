import {
  StyleSheet,
  Text,
  TextStyle,
  ActivityIndicator,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import React from 'react';
import {colors, fonts} from '../../utilities/theme';

const AppButton = ({
  title,
  customStyle,
  titleStyle,
  onPress,
  isLoading,
  disabled,
}: {
  title: string;
  customStyle?: ViewStyle;
  titleStyle?: TextStyle;
  onPress?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.container,
        customStyle,
        disabled ? styles.disabledButton : null,
      ]}>
      {isLoading ? (
        <ActivityIndicator color={'black'} size={'small'} />
      ) : (
        <Text style={[styles.title, titleStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default AppButton;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    marginTop: 24,
  },
  title: {
    fontSize: 14,
    color: colors.black,
    fontFamily: fonts.ReadexMedium,
    lineHeight: 25,
  },
  disabledButton: {
    backgroundColor: '#D3D3D3',
  },
  enabledButton: {
    backgroundColor: colors.secondry,
  },
});
