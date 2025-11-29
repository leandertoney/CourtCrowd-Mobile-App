import {
  StyleSheet,
  View,
  TextInput,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import React from 'react';
import {colors, fonts} from '../../utilities/theme';
import {SearchIcon} from '../../assets/svg';
interface Props extends TextInputProps {
  containerStyle?: ViewStyle;
  placeholder?: string;
  editable?: boolean;
  onPressIcon?: () => void;
  keyboardType?: TextInputProps['keyboardType'];
  onSubmitEditing?: () => void;
  ref?: React.RefObject<TextInput>;
  value?: string;
}

const SearchBar: React.FC<Props> = ({
  placeholder,
  editable,
  containerStyle,
  onPressIcon,
  keyboardType,
  onSubmitEditing,
  value,
  ref,
  ...rest
}) => {
  return (
    <View style={[styles.Container, containerStyle]}>
      <SearchIcon />
      <TextInput
        ref={ref}
        style={styles.textStyle}
        textAlignVertical="center"
        value={value}
        placeholderTextColor={colors.gray[100]}
        keyboardType={keyboardType}
        onSubmitEditing={onSubmitEditing}
        placeholder={placeholder}
        editable={editable}
        keyboardAppearance="dark"
        {...rest}
      />
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  Container: {
    backgroundColor: 'black',
    marginBottom: 1,
    borderRadius: 12,
    flexDirection: 'row',
    height: 47,
    paddingHorizontal: 18,
    alignItems: 'center',
    borderColor: '#454545',
    borderWidth: 1,
    marginTop: 26,
    justifyContent: 'center',
  },
  textStyle: {
    fontSize: 12,
    fontFamily: fonts.ReadexMedium,
    color: colors.white,
    flex: 1,
    marginLeft: 10,
    height: 47,
    lineHeight: 16,
  },
});
