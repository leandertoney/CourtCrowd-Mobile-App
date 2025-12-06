import * as React from 'react';
import {Keyboard, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Home, Explore, Favorite, Notification, Profile} from '../screens/tabs';
import CustomBottomTab from './CustomBottomBar';
import {useColors} from '../contexts/ThemeContext';
import {fonts} from '../utilities/theme';

// Tab order: Search | Favorites | Home (center) | Notifications | Profile
export type BottomTabParamlist = {
  Search: undefined;
  Favorites: undefined;
  Home: undefined;
  Notifications: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamlist>();

function BottomTabs() {
  const colors = useColors();
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
      screenOptions={{
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.accent,
        tabBarStyle: [styles.tabBarStyle, {backgroundColor: colors.surface}],
        tabBarLabelStyle: styles.tabBarLabelStyle,
        tabBarItemStyle: styles.tabBarItemStyle,
        headerStyle: [styles.headerStyle, {backgroundColor: colors.background}],
        headerTitleStyle: [styles.headerTitleStyle, {color: colors.text.primary}],
        headerTitleAlign: 'center',
        headerShown: false,
        tabBarShowLabel: true,
        headerShadowVisible: false,
      }}>
      {/* Tab Order: Search | Favorites | Home | Notifications | Profile */}
      <Tab.Screen
        name="Search"
        component={Explore}
        options={{tabBarLabel: 'Search'}}
      />
      <Tab.Screen
        name="Favorites"
        component={Favorite}
        options={{tabBarLabel: 'Favorites'}}
      />
      <Tab.Screen
        name="Home"
        component={Home}
        options={{tabBarLabel: 'Home'}}
      />
      <Tab.Screen
        name="Notifications"
        component={Notification}
        options={{tabBarLabel: 'Alerts'}}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{tabBarLabel: 'Profile'}}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarStyle: {
    // No longer floating - embedded style
  },
  tabBarItemStyle: {
    height: 49,
    alignSelf: 'center',
  },
  headerTitleStyle: {
    fontSize: 22,
    fontFamily: fonts.display,
    textShadowColor: '#C82828',
    textShadowOffset: {width: 2, height: 1},
    textShadowRadius: 2,
  },
  tabBarLabelStyle: {
    justifyContent: 'center',
  },
  headerStyle: {},
});

export default BottomTabs;
