import {StyleSheet, View, FlatList, Text} from 'react-native';
import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamsList} from '../../../navigation/HomeNavigation';
import {BottomTabParamlist} from '../../../navigation/BottomNavigation';
import {colors, fonts} from '../../../utilities/theme';
import {ChatItem, SearchBar} from '../../../components';
import {CHAT_ARRAY} from '../../../constants/ChatArray';

type Props = NativeStackScreenProps<
  BottomTabParamlist & HomeStackParamsList,
  'Chat'
>;

const Chat: React.FC<Props> = ({navigation}) => {
  return (
    <View style={styles.container}>
      <SearchBar
        placeholder="Search"
        containerStyle={{marginTop: 0, marginBottom: 12}}
      />
      <Text
        style={{
          color: colors.white,
          fontSize: 22,
          fontFamily: fonts.ReadexSemiBold,
          textAlign: 'center',
          paddingTop: 100,
        }}>
        You currently have no active conversations.{' '}
      </Text>
      {/* <FlatList
        showsVerticalScrollIndicator={false}
        data={CHAT_ARRAY}
        contentContainerStyle={{paddingBottom: 130}}
        renderItem={({item, index}) => {
          return (
            <ChatItem
              title={item.title}
              image={item.image}
              body={item.body}
              time={item.time}
              isCount={item.isCount}
              // onPress={() => navigation.navigate('ChatDetail')}
            />
          );
        }}
      /> */}
    </View>
  );
};

export default Chat;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
    paddingHorizontal: 20,
  },
});
