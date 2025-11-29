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
}

const SearchPeopleItem: React.FC<Props> = ({name, imageUrl}) => {
  return (
    <TouchableOpacity style={styles.container}>
      <Image
        source={{
          uri: imageUrl,
        }}
        style={styles.imgStyle}
      />
      <Text style={styles.peopleName} numberOfLines={1}>
        {name}
      </Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.buttonContainer}>
          <Text style={styles.buttonText}>Follow</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buttonContainer, {backgroundColor: colors.gray[300]}]}>
          <Text style={[styles.buttonText, {color: colors.white}]}>Remove</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default SearchPeopleItem;

const styles = StyleSheet.create({
  container: {
    width: 172,
    height: 228,
    borderRadius: 4,
    borderColor: colors.gray[250],
    borderWidth: 0.3,
    padding: 16,
  },
  imgStyle: {
    width: 140,
    height: 140,
    borderRadius: 100,
    alignSelf: 'center',
  },
  peopleName: {
    fontSize: 13,
    fontFamily: fonts.ReadexMedium,
    color: colors.white,
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  buttonContainer: {
    backgroundColor: colors.primary,
    width: '47%',
    height: 22,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 11,
    fontFamily: fonts.ReadexMedium,
    color: colors.black,
  },
});
