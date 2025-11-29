import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {colors, fonts} from '../utilities/theme';
import BottomTabs from './BottomNavigation';
import {
  ChangePassword,
  ChatDetail,
  CourtDetails,
  EditProfile,
  Help,
  SearchPeople,
  Settings,
} from '../screens/tabs';
import {BackArrow, MenuIcon} from '../assets/svg';
import {IPlace} from '../interfaces/IPlace';

export type HomeStackParamsList = {
  BottomTabs: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  Settings: undefined;
  Help: undefined;
  CourtDetails: {court: IPlace};
  ChatDetail: {groupId: string};
  SearchPeople: undefined;
};

const HomeStackNavigator = () => {
  const HomeStack = createNativeStackNavigator<HomeStackParamsList>();
  return (
    <HomeStack.Navigator
      screenOptions={({route, navigation}) => ({
        headerStyle: styles.headerStyle,
        headerTitleStyle: styles.headerTitleStyle,
        headerTitleAlign: 'center',
        headerBackVisible: false, // Hides default back button
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{paddingRight: 15}}>
            <BackArrow />
          </TouchableOpacity>
        ),
      })}>
      <HomeStack.Screen
        name="BottomTabs"
        component={BottomTabs}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="EditProfile"
        component={EditProfile}
        options={{
          headerTitle: () => (
            <Text style={styles.headerTitleStyle}>Edit Profile</Text>
          ),
          headerShown: true,
        }}
      />

      <HomeStack.Screen
        name="ChangePassword"
        component={ChangePassword}
        options={{
          headerTitle: () => (
            <Text style={styles.headerTitleStyle}>Change Password</Text>
          ),
          headerShown: true,
        }}
      />

      <HomeStack.Screen
        name="Settings"
        component={Settings}
        options={{
          headerTitle: () => (
            <Text style={styles.headerTitleStyle}>Settings</Text>
          ),
          headerShown: true,
        }}
      />

      <HomeStack.Screen
        name="Help"
        component={Help}
        options={{
          headerTitle: () => (
            <Text style={styles.headerTitleStyle}>Help & Support</Text>
          ),
          headerShown: true,
        }}
      />

      <HomeStack.Screen
        name="CourtDetails"
        component={CourtDetails}
        options={{headerShown: false}}
      />

      <HomeStack.Screen
        name="ChatDetail"
        component={ChatDetail}
        options={{
          headerTitle: () => (
            <Text style={styles.headerTitleStyle}>Message</Text>
          ),
          headerShown: true,
        }}
      />

      <HomeStack.Screen
        name="SearchPeople"
        component={SearchPeople}
        options={{
          headerTitle: () => (
            <Text style={styles.headerTitleStyle}>Search</Text>
          ),
          headerShown: true,
        }}
      />
    </HomeStack.Navigator>
  );
};

export default HomeStackNavigator;

const styles = StyleSheet.create({
  headerStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.black,
  },
  headerTitleStyle: {
    fontSize: 22,
    fontFamily: fonts.GameDay,
    textShadowColor: '#C82828',
    textShadowOffset: {width: 2, height: 1},
    textShadowRadius: 2,
    color: colors.white,
    textAlign: 'center',
  },
});
