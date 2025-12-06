import {
  StyleSheet,
  View,
  TextInput,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import React from 'react';
import {fonts} from '../../utilities/theme';
import {useColors} from '../../contexts/ThemeContext';
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
  const colors = useColors();

  return (
    <View style={[
      styles.Container,
      {
        backgroundColor: colors.surface,
        borderColor: colors.border,
      },
      containerStyle
    ]}>
      <SearchIcon color={colors.text.secondary} />
      <TextInput
        ref={ref}
        style={[styles.textStyle, {color: colors.text.primary}]}
        textAlignVertical="center"
        value={value}
        placeholderTextColor={colors.text.tertiary}
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
    marginBottom: 1,
    borderRadius: 12,
    flexDirection: 'row',
    height: 47,
    paddingHorizontal: 18,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 26,
    justifyContent: 'center',
  },
  textStyle: {
    fontSize: 14,
    fontFamily: fonts.ReadexMedium,
    flex: 1,
    marginLeft: 10,
    height: 47,
    lineHeight: 16,
  },
});
