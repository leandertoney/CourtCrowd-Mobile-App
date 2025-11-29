import {
    Image,
    ImageSourcePropType,
    Platform,
    Pressable,
    StyleSheet,
    View,
    useWindowDimensions,
  } from 'react-native';
  import React, {memo} from 'react';
  import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
  import Animated, {
    useAnimatedStyle,
    withSpring,
    withTiming,
  } from 'react-native-reanimated';
  import {useSafeAreaInsets} from 'react-native-safe-area-context';
  import {images} from '../assets/images';
  
  const TabBarIcon = memo(
    ({
      iconSource,
      focused,
    }: {
      iconSource: ImageSourcePropType;
      focused: boolean;
    }) => {
      const animatedStyle = useAnimatedStyle(() => {
        return {
          transform: [{scale: withTiming(focused ? 1.3 : 1, {duration: 400})}],
          opacity: withTiming(focused ? 1 : 0.6, {duration: 300}),
        };
      });
  
      return (
        <Animated.View style={animatedStyle}>
          <Image resizeMode="contain" style={styles.icon} source={iconSource} />
        </Animated.View>
      );
    },
  );
  
  const CustomBottomTab = ({
    state,
    descriptors,
    navigation,
  }: BottomTabBarProps) => {
    const insets = useSafeAreaInsets();
    const {width} = useWindowDimensions();
    const MARGIN = 20;
    const TAB_BAR_WIDTH = width - 2 * MARGIN;
    const TAB_WIDTH = TAB_BAR_WIDTH / state.routes.length;
  
    const translateAnimation = useAnimatedStyle(() => {
      return {
        transform: [
          {
            translateX: withSpring(TAB_WIDTH * state.index, {
              mass: 0.7,
            }),
          },
        ],
      };
    });
  
    return (
      <View
        style={[
          styles.tabBarContainer,
          {
            width: TAB_BAR_WIDTH,
            bottom: Platform.OS === 'android' ? 12 : insets.bottom,
          },
        ]}>
        <Animated.View
          style={[
            styles.slidingTabContainer,
            {width: TAB_WIDTH},
            translateAnimation,
          ]}>
          <View style={styles.slidingTab} />
        </Animated.View>
        {state.routes.map((route, index) => {
          const {options} = descriptors[route.key];
  
          const focused = state.index === index;
  
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
  
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, {merge: true});
            }
          };
  
          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };
  
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
            <Pressable
              key={index}
              accessibilityRole="button"
              accessibilityState={focused ? {selected: true} : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={{flex: 1}}>
              <View style={styles.contentContainer}>
                <TabBarIcon iconSource={source} focused={focused} />
              </View>
            </Pressable>
          );
        })}
      </View>
    );
  };
  
  export default CustomBottomTab;
  
  const styles = StyleSheet.create({
    tabBarContainer: {
      flex: 1,
      flexDirection: 'row',
      height: 90,
      position: 'absolute',
      alignSelf: 'center',
      backgroundColor: '#131313',
      // backgroundColor: 'blue',
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'space-around',
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#92929233',
      marginBottom: Platform.OS === 'android' ? 0 : -20,
    },
    slidingTabContainer: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
    },
    slidingTab: {
      width: 60,
      height: 60,
      borderRadius: 100,
      backgroundColor: '#CAFF00',
    },
    contentContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 4,
    },
    icon: {
      width: 22,
      height: 22,
    },
  });
  