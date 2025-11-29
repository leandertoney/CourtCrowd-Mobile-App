import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TextInputProps,
  TextStyle,
  ViewStyle,
} from 'react-native';
import {FC} from 'react';
import {colors, fonts} from '../../utilities/theme';
import React from 'react';

interface Props extends TextInputProps {
  textinputStyles?: TextStyle;
  title?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  value?: string;
  containerStyle?: ViewStyle;
  innerContainer?: ViewStyle;
  titleStyle?: TextStyle;
  error?: boolean;
  errorMessage?: string | false;
  multiline?: boolean;
  numberOfLines?: number;
}

const MultilineInput: FC<Props> = ({
  value,
  secureTextEntry,
  title,
  containerStyle,
  innerContainer,
  errorMessage,
  titleStyle,
  textinputStyles,
  error,
  multiline,
  numberOfLines,
  ...rest
}) => {
  return (
    <View style={containerStyle}>
      <Text style={styles.titleStyle}>{title}</Text>
      <View style={[styles.container, innerContainer]}>
        <TextInput
          style={[
            styles.subTitleStyle,
            textinputStyles,
            multiline && styles.multilineStyle,
          ]}
          placeholderTextColor={'#888888'}
          secureTextEntry={secureTextEntry}
          value={value}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical="top"
          {...rest}
          scrollEnabled={multiline}
          keyboardAppearance="dark"
        />
      </View>
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 40,
    borderBottomColor: colors.white,
    borderBottomWidth: 1,
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
  },
  titleStyle: {
    color: colors.white,
    fontSize: 13,
    fontFamily: fonts.ReadexRegular,
    marginTop: 16,
  },
  subTitleStyle: {
    flex: 1,
    color: colors.white,
    fontSize: 14,
    fontFamily: fonts.ReadexRegular,
  },
  multilineStyle: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  errorText: {
    color: colors.red,
    marginTop: 3,
    fontSize: 12,
    fontFamily: fonts.ReadexMedium,
  },
});

export default MultilineInput;
