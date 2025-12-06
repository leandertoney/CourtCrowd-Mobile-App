import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  TextInputProps,
  TextStyle,
  ViewStyle,
} from 'react-native';
import {images} from '../../assets/images';
import {FC} from 'react';
import {fonts} from '../../utilities/theme';
import {useColors} from '../../contexts/ThemeContext';
import Text from '../ui/Text';
import React from 'react';

interface Props extends TextInputProps {
  isPassword?: boolean;
  onLeftIconPress?: () => void;
  editIcon?: boolean;
  textinputStyles?: TextStyle;
  title?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  value?: string;
  leftIcon?: ImageSourcePropType;
  RightIcon?: ImageSourcePropType;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  innerContainer?: ViewStyle;
  leftIconContainer?: ViewStyle;
  titleStyle?: TextStyle;
  error?: boolean;
  errorMessage?: string | false;
}

const FormInput: FC<Props> = ({
  value,
  secureTextEntry,
  leftIcon,
  onLeftIconPress,
  title,
  isPassword,
  onRightIconPress,
  RightIcon,
  containerStyle,
  innerContainer,
  leftIconContainer,
  errorMessage,
  titleStyle,
  textinputStyles,
  error,
  ...rest
}) => {
  const colors = useColors();

  return (
    <View style={containerStyle}>
      <Text variant="label" style={[styles.titleStyle, {color: colors.text.primary}]}>{title}</Text>
      <View style={[styles.container, {borderBottomColor: colors.border}, innerContainer]}>
        <TextInput
          style={[styles.subTitleStyle, {color: colors.text.primary}]}
          placeholderTextColor={colors.text.tertiary}
          secureTextEntry={secureTextEntry}
          value={value}
          {...rest}
          scrollEnabled={true}
          keyboardAppearance="dark"
        />
        {isPassword ? (
          <TouchableOpacity onPress={onLeftIconPress}>
            <Image
              source={secureTextEntry ? images.hideicon : images.unhideicon}
              style={[
                styles.leftIconContainer,
                {tintColor: colors.text.primary},
              ]}
            />
          </TouchableOpacity>
        ) : RightIcon ? (
          <TouchableOpacity onPress={onRightIconPress} activeOpacity={0.7}>
            <Image
              source={RightIcon}
              style={[styles.leftIconContainer, {tintColor: colors.text.primary}]}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {errorMessage && <Text variant="caption" style={[styles.errorText, {color: colors.error}]}>{errorMessage}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 2,
    paddingRight: 10,
    paddingVertical: 2,
  },
  titleStyle: {
    fontSize: 13,
    fontFamily: fonts.ReadexRegular,
    marginTop: 20,
  },
  subTitleStyle: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.ReadexRegular,
  },
  leftIconContainer: {
    width: 20,
    height: 20,
  },
  errorText: {
    marginTop: 3,
    fontSize: 12,
    fontFamily: fonts.ReadexMedium,
  },
});

export default FormInput;
