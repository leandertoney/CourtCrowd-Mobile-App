import {StyleSheet, TextInputProps, Text, View} from 'react-native';
import React, {useState} from 'react';
import {colors, fonts} from '../../utilities/theme';
import ToggleSwitch from 'toggle-switch-react-native';

interface Props extends TextInputProps {
  title?: string;
  isSubTitle?: boolean;
  subTitle?: string;
  isOn?: boolean;
  onToggle?: () => void;
}

const ToggleSwitchItem: React.FC<Props> = ({
  title,
  isSubTitle,
  subTitle,
  isOn = false,
  onToggle,
}) => {
  return (
    <View style={styles.containerRow}>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <ToggleSwitch
          isOn={isOn}
          onColor={colors.primary}
          offColor="#424242"
          size="medium"
          onToggle={onToggle}
        />
      </View>
      {isSubTitle ? <Text style={styles.subTitle}>{subTitle}</Text> : null}
    </View>
  );
};

export default ToggleSwitchItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  containerRow: {
    flexDirection: 'column',
    paddingVertical: 16,
    marginTop: 4,
    borderBottomColor: '#EAECF0',
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 14,
    fontFamily: fonts.ReadexRegular,
    color: colors.white,
    flex: 1,
  },
  subTitle: {
    color: '#7A7A7A',
    fontSize: 10,
    fontFamily: fonts.ReadexRegular,
    marginTop: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
