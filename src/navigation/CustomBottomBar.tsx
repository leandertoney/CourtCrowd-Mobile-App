import {
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import React, {memo} from 'react';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useColors} from '../contexts/ThemeContext';
import {fonts} from '../utilities/theme';
import Svg, {Path, Circle} from 'react-native-svg';

// =============================================================================
// TAB ICONS (SVG)
// =============================================================================

interface IconProps {
  color: string;
  size?: number;
  filled?: boolean;
}

const SearchIcon: React.FC<IconProps> = ({color, size = 24, filled}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle
      cx="11"
      cy="11"
      r="8"
      stroke={color}
      strokeWidth="2"
      fill={filled ? color : 'none'}
      fillOpacity={filled ? 0.15 : 0}
    />
    <Path
      d="M21 21l-4.35-4.35"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const HeartIcon: React.FC<IconProps> = ({color, size = 24, filled}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
    <Path
      d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const HomeIcon: React.FC<IconProps> = ({color, size = 28, filled}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
    <Path
      d="M3 9.5L12 3L21 9.5V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9.5Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 22V12H15V22"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={filled ? color : 'none'}
      fillOpacity={filled ? 0.3 : 0}
    />
  </Svg>
);

const BellIcon: React.FC<IconProps> = ({color, size = 24, filled}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
    <Path
      d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M13.73 21a2 2 0 01-3.46 0"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ProfileIcon: React.FC<IconProps> = ({color, size = 24, filled}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={filled ? color : 'none'}
      fillOpacity={filled ? 0.15 : 0}
    />
    <Circle
      cx="12"
      cy="7"
      r="4"
      stroke={color}
      strokeWidth="2"
      fill={filled ? color : 'none'}
    />
  </Svg>
);

// =============================================================================
// TAB BAR ICON
// =============================================================================

const TabBarIcon = memo(
  ({
    routeName,
    focused,
    accentColor,
    inactiveColor,
  }: {
    routeName: string;
    focused: boolean;
    accentColor: string;
    inactiveColor: string;
  }) => {
    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{scale: withSpring(focused ? 1.1 : 1, {damping: 15})}],
      };
    });

    const color = focused ? accentColor : inactiveColor;
    const isHome = routeName === 'Home';

    const renderIcon = () => {
      const size = isHome ? 28 : 24;
      switch (routeName) {
        case 'Search':
          return <SearchIcon color={color} size={size} filled={focused} />;
        case 'Favorites':
          return <HeartIcon color={color} size={size} filled={focused} />;
        case 'Home':
          return <HomeIcon color={color} size={size} filled={focused} />;
        case 'Notifications':
          return <BellIcon color={color} size={size} filled={focused} />;
        case 'Profile':
          return <ProfileIcon color={color} size={size} filled={focused} />;
        default:
          return <HomeIcon color={color} size={size} filled={focused} />;
      }
    };

    return <Animated.View style={animatedStyle}>{renderIcon()}</Animated.View>;
  },
);

// =============================================================================
// TAB LABEL
// =============================================================================

const TabLabel = memo(
  ({
    label,
    focused,
    accentColor,
    inactiveColor,
  }: {
    label: string;
    focused: boolean;
    accentColor: string;
    inactiveColor: string;
  }) => {
    const animatedStyle = useAnimatedStyle(() => {
      return {
        opacity: withTiming(focused ? 1 : 0.6, {duration: 200}),
      };
    });

    return (
      <Animated.Text
        style={[
          styles.tabLabel,
          {color: focused ? accentColor : inactiveColor},
          animatedStyle,
        ]}>
        {label}
      </Animated.Text>
    );
  },
);

// =============================================================================
// CUSTOM BOTTOM TAB
// =============================================================================

const CustomBottomTab = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  // iOS standard tab bar height is 49pt, plus safe area
  const TAB_BAR_HEIGHT = 49;
  const bottomPadding = Platform.OS === 'ios' ? insets.bottom : 16;

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: bottomPadding,
          height: TAB_BAR_HEIGHT + bottomPadding,
        },
      ]}>
      {state.routes.map((route, index) => {
        const {options} = descriptors[route.key];
        const focused = state.index === index;
        const isHome = route.name === 'Home';

        // Get label from options or route name
        const label =
          options.tabBarLabel !== undefined
            ? String(options.tabBarLabel)
            : options.title !== undefined
            ? options.title
            : route.name;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        // Home button has special elevated styling
        if (isHome) {
          return (
            <Pressable
              key={index}
              accessibilityRole="button"
              accessibilityState={focused ? {selected: true} : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.homeTabContainer}>
              <Animated.View
                style={[
                  styles.homeButton,
                  {
                    backgroundColor: focused ? colors.accent : colors.surfaceLight,
                    shadowColor: colors.accent,
                    shadowOpacity: focused ? 0.4 : 0,
                  },
                ]}>
                <TabBarIcon
                  routeName={route.name}
                  focused={focused}
                  accentColor={focused ? colors.background : colors.text.secondary}
                  inactiveColor={colors.text.secondary}
                />
              </Animated.View>
            </Pressable>
          );
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
            style={styles.tabButton}>
            <View style={styles.contentContainer}>
              <TabBarIcon
                routeName={route.name}
                focused={focused}
                accentColor={colors.accent}
                inactiveColor={colors.text.tertiary}
              />
              <TabLabel
                label={label}
                focused={focused}
                accentColor={colors.accent}
                inactiveColor={colors.text.tertiary}
              />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

export default CustomBottomTab;

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    borderTopWidth: 0.5,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: fonts.ReadexMedium,
    marginTop: 2,
  },
  homeTabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  homeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 8,
    elevation: 8,
  },
});
