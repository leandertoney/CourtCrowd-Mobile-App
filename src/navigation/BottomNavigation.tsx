import * as React from 'react';
import {Image, Keyboard, StyleSheet, View} from 'react-native';
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {colors, fonts} from '../utilities/theme';
import {Chat, Favorite, Home, Notification, Profile} from '../screens/tabs';
import {images} from '../assets/images';
import CustomBottomTab from './CustomBottomBar';
export type BottomTabParamlist = {
  Home: undefined;
  Favorite: undefined;
  Notification: undefined;
  Chat: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamlist>();

function BottomTabs() {
  const [isKeyboardVisible, setKeyboardVisible] = React.useState(false);

  React.useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });

    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);
  const CustomBottomNavigation = (props: any) => {
    if (isKeyboardVisible) {
      return null;
    }
    return <CustomBottomTab {...props} />;
  };

  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={CustomBottomNavigation}
      screenOptions={({route}) => ({
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.primary,
        tabBarStyle: styles.tabBarStyle,
        tabBarLabelStyle: styles.tabBarLabelStyle,
        tabBarItemStyle: styles.tabBarItemStyle,
        headerStyle: styles.headerStyle,
        headerTitleStyle: styles.headerTitleStyle,
        headerTitleAlign: 'center',
        headerShown: false,
        tabBarShowLabel: false,
        headerShadowVisible: false,

        tabBarIcon: ({color, focused}) => {
          let source;
          switch (route.name) {
            case 'Favorite':
              source = focused ? images.Favoritefill : images.favoriteicon;
              break;
            case 'Notification':
              source = focused
                ? images.Notificationfill
                : images.notificationicon;
              break;
            case 'Home':
              source = focused ? images.Homefill : images.homeicon;
              break;

            case 'Chat':
              source = focused ? images.Chatfill : images.chaticon;
              break;
            case 'Profile':
              source = focused ? images.Profilefill : images.profileicon;
              break;
          }
          return (
            <View
              style={[
                styles.iconContainer,
                focused && {backgroundColor: colors.primary},
              ]}>
              <Image
                resizeMode="contain"
                style={[styles.icon]}
                source={source}
              />
            </View>
          );
        },
      })}>
      <Tab.Screen
        name="Favorite"
        component={Favorite}
        options={{headerShown: true}}
      />
      <Tab.Screen
        name="Notification"
        component={Notification}
        options={{headerShown: true}}
      />
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen
        name="Chat"
        component={Chat}
        options={{headerShown: true, headerTitle: 'Chats'}}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{headerShown: true, headerTitleAlign: 'left'}}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 22,
    height: 22,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 32,
  },
  tabBarStyle: {
    height: 80,
    backgroundColor: '#131313',
    marginHorizontal: 20,
    borderRadius: 20,
    borderColor: '#92929233',
    borderWidth: 2,
    marginBottom: 10,
    position: 'absolute',
  },
  tabBarItemStyle: {
    height: 43,
    alignSelf: 'center',
  },
  headerTitleStyle: {
    fontSize: 22,
    fontFamily: fonts.GameDay,
    textShadowColor: '#C82828',
    textShadowOffset: {width: 2, height: 1},
    textShadowRadius: 2,
    color: colors.white,
  },
  tabBarLabelStyle: {
    justifyContent: 'center',
  },
  headerStyle: {
    backgroundColor: colors.black,
  },
  hitSlop: {
    left: 10,
    right: 10,
    bottom: 10,
    top: 10,
  },
});

export default BottomTabs;
