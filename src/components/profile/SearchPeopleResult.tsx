import {
  StyleSheet,
  TextInputProps,
  Text,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import {colors, fonts} from '../../utilities/theme';

interface Props extends TextInputProps {
  name?: string;
  imageUrl?: string;
  email?: string;
}

const SearchPeopleResult: React.FC<Props> = ({imageUrl, name, email}) => {
  return (
    <TouchableOpacity style={styles.container}>
      <View style={styles.imageRow}>
        <Image
          source={{
            uri: imageUrl,
          }}
          style={styles.imgStyle}
        />
        <View style={{flexDirection: 'column'}}>
          <Text style={styles.nameText}>{name}</Text>
          <Text style={styles.emailText}>{email}</Text>
        </View>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.buttonContainer}>
          <Text style={styles.buttonText}>Follow</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buttonContainer, {backgroundColor: colors.gray[300]}]}>
          <Text
            style={[
              styles.buttonText,
              {color: colors.white, fontFamily: fonts.ReadexRegular},
            ]}>
            Remove
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default SearchPeopleResult;

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    backgroundColor: colors.blackLight,
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
  },
  imageRow: {flexDirection: 'row', alignItems: 'center', gap: 9},
  imgStyle: {width: 40, height: 40, borderRadius: 100},
  nameText: {
    fontSize: 14,
    fontFamily: fonts.ReadexRegular,
    color: colors.white,
  },
  emailText: {
    fontSize: 10,
    fontFamily: fonts.ReadexRegular,
    color: colors.gray[350],
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    width: '65%',
  },
  buttonContainer: {
    backgroundColor: colors.primary,
    width: '48%',
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontFamily: fonts.ReadexMedium,
    color: colors.black,
  },
});
