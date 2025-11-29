import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  TextInputProps,
  TextStyle,
  ViewStyle,
} from 'react-native';
import {images} from '../../assets/images';
import {FC} from 'react';
import {colors, fonts} from '../../utilities/theme';
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
  return (
    <View style={containerStyle}>
      <Text style={styles.titleStyle}>{title}</Text>
      <View style={[styles.container, innerContainer]}>
        <TextInput
          style={styles.subTitleStyle}
          placeholderTextColor={'#888888'}
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
                {tintColor: value ? 'white' : 'white'},
              ]}
            />
          </TouchableOpacity>
        ) : RightIcon ? (
          <TouchableOpacity onPress={onRightIconPress} activeOpacity={0.7}>
            <Image
              source={RightIcon}
              style={styles.leftIconContainer}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // height: 40,
    borderBottomColor: colors.white,
    borderBottomWidth: 1,
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 2,
    paddingRight: 10,
    paddingVertical: 2,
  },
  titleStyle: {
    color: colors.white,
    fontSize: 13,
    fontFamily: fonts.ReadexRegular,
    marginTop: 20,
  },
  subTitleStyle: {
    flex: 1,
    color: colors.white,
    fontSize: 14,
    fontFamily: fonts.ReadexRegular,
  },
  leftIconContainer: {
    width: 20,
    height: 20,
  },
  errorText: {
    color: colors.red,
    marginTop: 3,
    fontSize: 12,
    fontFamily: fonts.ReadexMedium,
  },
});

export default FormInput;
