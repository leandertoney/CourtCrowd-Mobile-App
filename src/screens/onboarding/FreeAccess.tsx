import React, {useEffect} from 'react';
import {StyleSheet, View, Dimensions} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {OnboardingStackParamList} from '../../navigation/OnboardingNavigation';
import {OnboardingScreen} from '../../components/onboarding';
import Button from '../../components/ui/Button';
import Text from '../../components/ui/Text';
import {useAppDispatch} from '../../store';
import {completeOnboarding} from '../../store/slices/onboardingSlice';
import {useColors} from '../../contexts/ThemeContext';
import {spacing, borderRadius} from '../../utilities/theme';
import Animated, {
  FadeIn,
  FadeInUp,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import Svg, {Path, Circle} from 'react-native-svg';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

type Props = NativeStackScreenProps<OnboardingStackParamList, 'FreeAccess'>;

// Celebration icon with animation
const CelebrationIcon: React.FC<{colors: any}> = ({colors}) => {
  const bounce = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withTiming(1.1, {duration: 600}),
        withTiming(1, {duration: 600}),
      ),
      -1,
      true,
    );
    rotate.value = withRepeat(
      withSequence(
        withTiming(-5, {duration: 300}),
        withTiming(5, {duration: 600}),
        withTiming(0, {duration: 300}),
      ),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {scale: bounce.value},
      {rotate: `${rotate.value}deg`},
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Svg width={80} height={80} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="11" fill={colors.accent} />
        <Path
          d="M9 12l2 2 4-4"
          stroke={colors.background}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </Animated.View>
  );
};

// Check icon for features
const CheckIcon: React.FC<{color: string; size?: number}> = ({color, size = 20}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6L9 17l-5-5"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Feature item with icon
const FeatureCheck: React.FC<{text: string; delay: number; colors: any}> = ({
  text,
  delay,
  colors,
}) => (
  <Animated.View
    entering={FadeInUp.duration(400).delay(delay)}
    style={styles.featureRow}>
    <View style={[styles.checkCircle, {backgroundColor: colors.accent + '20'}]}>
      <CheckIcon color={colors.accent} size={14} />
    </View>
    <Text variant="body" style={{flex: 1}}>
      {text}
    </Text>
  </Animated.View>
);

// Confetti particle
const ConfettiParticle: React.FC<{
  x: number;
  delay: number;
  color: string;
}> = ({x, delay, color}) => {
  const translateY = useSharedValue(-20);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(SCREEN_HEIGHT * 0.5, {duration: 2000}),
    );
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(1, {duration: 200}),
        withTiming(1, {duration: 1500}),
        withTiming(0, {duration: 300}),
      ),
    );
  }, [delay]);

  const style = useAnimatedStyle(() => ({
    transform: [{translateY: translateY.value}],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.confetti,
        {left: x, backgroundColor: color},
        style,
      ]}
    />
  );
};

const FreeAccess: React.FC<Props> = ({navigation}) => {
  const colors = useColors();
  const dispatch = useAppDispatch();

  const confettiColors = [colors.accent, colors.success, '#FF6B6B', '#4ECDC4', '#FFEAA7'];

  const handleSeeWhosPlaying = () => {
    dispatch(completeOnboarding());
  };

  return (
    <OnboardingScreen>
      {/* Confetti particles */}
      {confettiColors.map((color, i) => (
        <ConfettiParticle
          key={`left-${i}`}
          x={20 + i * 30}
          delay={200 + i * 100}
          color={color}
        />
      ))}
      {confettiColors.map((color, i) => (
        <ConfettiParticle
          key={`right-${i}`}
          x={SCREEN_WIDTH - 50 - i * 30}
          delay={300 + i * 100}
          color={color}
        />
      ))}

      <View style={styles.container}>
        {/* Celebration Section - Takes 60% */}
        <View style={styles.celebrationSection}>
          <Animated.View
            entering={FadeIn.duration(600).delay(200)}
            style={styles.iconContainer}>
            <CelebrationIcon colors={colors} />
          </Animated.View>

          <Animated.View
            entering={FadeInUp.duration(500).delay(400)}
            style={styles.headerContainer}>
            <Text variant="h1" style={styles.title}>
              You're Ready!
            </Text>
            <Text variant="body" color="secondary" style={styles.subtitle}>
              No more guessing, no more empty courts
            </Text>
          </Animated.View>

          {/* What you get */}
          <Animated.View
            entering={FadeInUp.duration(400).delay(600)}
            style={[styles.featuresContainer, {backgroundColor: colors.surfaceLight}]}>
            <FeatureCheck
              text="Live player counts at every court"
              delay={700}
              colors={colors}
            />
            <FeatureCheck
              text="Real-time activity updates"
              delay={800}
              colors={colors}
            />
            <FeatureCheck
              text="Discover courts nearby"
              delay={900}
              colors={colors}
            />
          </Animated.View>
        </View>

        {/* CTA Section - Takes 40% */}
        <View style={styles.ctaSection}>
          <Animated.View
            entering={FadeInUp.duration(400).delay(1100)}
            style={styles.ctaContainer}>
            <Button
              title="See Who's Playing"
              onPress={handleSeeWhosPlaying}
              size="lg"
            />
          </Animated.View>

          <Animated.View
            entering={FadeIn.duration(400).delay(1300)}
            style={styles.upgradeHint}>
            <Text variant="caption" color="tertiary" style={styles.hintText}>
              You can upgrade to Pro anytime in Settings
            </Text>
          </Animated.View>
        </View>
      </View>
    </OnboardingScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  celebrationSection: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  featuresContainer: {
    width: '100%',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: spacing.xl,
  },
  ctaContainer: {
    marginBottom: spacing.lg,
  },
  upgradeHint: {
    alignItems: 'center',
  },
  hintText: {
    textAlign: 'center',
  },
  confetti: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: 0,
  },
});

export default FreeAccess;
