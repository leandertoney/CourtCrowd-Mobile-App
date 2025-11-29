import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ForgotPassword, LogIn, SignUp} from '../screens/authflow';
import {TouchableOpacity} from 'react-native';
import {BackArrow} from '../assets/svg';
import {colors, fonts} from '../utilities/theme';

export type AuthStackParamList = {
  LogIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

const AuthStackNavigator = () => {
  return (
    <AuthStack.Navigator
      screenOptions={({navigation}) => ({
        headerShown: true,
        headerShadowVisible: false,
        headerTitleAlign: 'left',
        headerTransparent: true,
        headerStyle: {
          backgroundColor: 'transparent',
        },

        headerTitleStyle: {
          fontSize: 20,
          fontFamily: fonts.GameDay,
          textShadowColor: '#C82828',
          textShadowOffset: {width: 2, height: 1},
          textShadowRadius: 2,
          color: colors.white,
        },
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={6}>
            <BackArrow />
          </TouchableOpacity>
        ),
      })}>
      <AuthStack.Screen
        name="LogIn"
        component={LogIn}
        options={{headerShown: false}}
      />

      <AuthStack.Screen
        name="SignUp"
        component={SignUp}
        options={{headerShown: false}}
      />

      <AuthStack.Screen
        name="ForgotPassword"
        component={ForgotPassword}
        options={{headerShown: true, title: ''}}
      />
    </AuthStack.Navigator>
  );
};

export default AuthStackNavigator;
