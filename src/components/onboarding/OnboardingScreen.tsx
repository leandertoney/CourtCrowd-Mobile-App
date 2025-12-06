import React from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useColors} from '../../contexts/ThemeContext';
import {spacing} from '../../utilities/theme';
import {images} from '../../assets/images';
import Animated, {FadeIn} from 'react-native-reanimated';

interface OnboardingScreenProps {
  children: React.ReactNode;
  centered?: boolean;
  noPadding?: boolean;
  showLogo?: boolean;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  children,
  centered = false,
  noPadding = false,
  showLogo = true,
}) => {
  const colors = useColors();

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        {showLogo && (
          <View style={styles.logoContainer}>
            <Image
              source={images.HomeTitle}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        )}
        <Animated.View
          entering={FadeIn.duration(400)}
          style={[
            styles.content,
            centered && styles.centered,
            noPadding && styles.noPadding,
          ]}>
          {children}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  logo: {
    height: 36,
    width: 160,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  centered: {
    justifyContent: 'center',
  },
  noPadding: {
    paddingHorizontal: 0,
  },
});

export default OnboardingScreen;
