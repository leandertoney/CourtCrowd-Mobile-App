import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {View, StyleSheet, Text, TouchableOpacity, FlatList} from 'react-native';
import {HomeStackParamsList} from '../../../navigation/HomeNavigation';
import {BottomTabParamlist} from '../../../navigation/BottomNavigation';
import {colors, fonts} from '../../../utilities/theme';
import {
  SearchBar,
  SearchPeopleItem,
  SearchPeopleResult,
} from '../../../components';
import {SearchPeopleArray} from '../../../constants/SearchPeopleArray';

type Props = NativeStackScreenProps<
  BottomTabParamlist & HomeStackParamsList,
  'SearchPeople'
>;

const SearchPeople: React.FC<Props> = ({navigation}) => {
  const [searchText, setSearchText] = useState('');

  return (
    <View style={styles.container}>
      <SearchBar
        placeholder="Search Nearby Court"
        containerStyle={{marginTop: 12, marginHorizontal: 20}}
        value={searchText}
        onChangeText={setSearchText}
      />

      {searchText ? (
        <>
          <Text style={[styles.title, styles.searchText]}>Search Results</Text>
          <SearchPeopleResult
            imageUrl="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRa8Vy_BBRVeWcmRG9601UpogLfLF-XMV_JLQ&s"
            name="Ralph Edwards"
            email="Example@gmail.com"
          />
        </>
      ) : (
        <>
          <View style={styles.titleRow}>
            <Text style={styles.title}>People you may know</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={SearchPeopleArray}
            horizontal
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <SearchPeopleItem imageUrl={item.imageUrl} name={item.name} />
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.contentContainerStyle}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  searchResultText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    color: colors.white,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginHorizontal: 20,
  },
  searchText: {marginHorizontal: 20, marginTop: 24},
  title: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fonts.ReadexSemiBold,
  },
  seeAll: {
    fontSize: 12,
    fontFamily: fonts.ReadexRegular,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  contentContainerStyle: {paddingHorizontal: 16, marginTop: 12, gap: 16},
});

export default SearchPeople;
