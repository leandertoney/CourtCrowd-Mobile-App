import React from 'react';
import {StyleSheet, View, Dimensions} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {OnboardingStackParamList} from '../../navigation/OnboardingNavigation';
import {OnboardingScreen} from '../../components/onboarding';
import Button from '../../components/ui/Button';
import Text from '../../components/ui/Text';
import {useColors} from '../../contexts/ThemeContext';
import {spacing} from '../../utilities/theme';
import Animated, {
  FadeIn,
  FadeInUp,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
} from 'react-native-reanimated';
import {useEffect} from 'react';
import Svg, {Circle, Path, G} from 'react-native-svg';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Welcome'>;

// Animated player dot component
const PlayerDot: React.FC<{
  color: string;
  delay: number;
  x: number;
  y: number;
  size?: number;
}> = ({color, delay, x, y, size = 12}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.8);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.2, {duration: 800}),
          withTiming(1, {duration: 800}),
        ),
        -1,
        true,
      ),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, {duration: 800}),
          withTiming(0.6, {duration: 800}),
        ),
        -1,
        true,
      ),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
};

// Court marker with activity indicator
const CourtMarker: React.FC<{
  x: number;
  y: number;
  playerCount: number;
  isEmpty?: boolean;
  colors: any;
  delay: number;
}> = ({x, y, playerCount, isEmpty, colors, delay}) => {
  const playerColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

  return (
    <Animated.View
      entering={FadeIn.duration(400).delay(delay)}
      style={[styles.courtMarker, {left: x, top: y}]}>
      {/* Court pin */}
      <View style={[styles.pinContainer, {backgroundColor: isEmpty ? colors.surfaceLight : colors.accent}]}>
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
            fill={isEmpty ? colors.text.tertiary : colors.background}
          />
        </Svg>
      </View>

      {/* Player dots clustered around court */}
      {!isEmpty &&
        Array.from({length: Math.min(playerCount, 5)}).map((_, i) => {
          const angle = (i / playerCount) * Math.PI * 2 - Math.PI / 2;
          const radius = 18 + (i % 2) * 6;
          const dotX = Math.cos(angle) * radius + 16;
          const dotY = Math.sin(angle) * radius + 16;
          return (
            <PlayerDot
              key={i}
              color={playerColors[i % playerColors.length]}
              delay={delay + i * 100}
              x={dotX}
              y={dotY}
              size={10}
            />
          );
        })}

      {/* Player count badge */}
      {!isEmpty && playerCount > 0 && (
        <View style={[styles.countBadge, {backgroundColor: colors.accent}]}>
          <Text style={[styles.countText, {color: colors.background}]}>
            {playerCount}
          </Text>
        </View>
      )}

      {/* Empty indicator */}
      {isEmpty && (
        <View style={[styles.emptyBadge, {backgroundColor: colors.surfaceLight}]}>
          <Text style={[styles.emptyText, {color: colors.text.tertiary}]}>0</Text>
        </View>
      )}
    </Animated.View>
  );
};

const Welcome: React.FC<Props> = ({navigation}) => {
  const colors = useColors();

  return (
    <OnboardingScreen>
      <View style={styles.container}>
        {/* Illustration Section - Takes 60%+ of screen */}
        <View style={styles.illustrationSection}>
          <Animated.View
            entering={FadeIn.duration(800).delay(200)}
            style={[styles.mapContainer, {backgroundColor: colors.surfaceLight}]}>
            {/* Stylized map background lines */}
            <View style={styles.mapLines}>
              {[...Array(5)].map((_, i) => (
                <View
                  key={`h-${i}`}
                  style={[
                    styles.mapLine,
                    styles.horizontalLine,
                    {
                      top: `${20 + i * 15}%`,
                      backgroundColor: colors.border,
                    },
                  ]}
                />
              ))}
              {[...Array(4)].map((_, i) => (
                <View
                  key={`v-${i}`}
                  style={[
                    styles.mapLine,
                    styles.verticalLine,
                    {
                      left: `${25 + i * 20}%`,
                      backgroundColor: colors.border,
                    },
                  ]}
                />
              ))}
            </View>

            {/* Court markers with varying activity */}
            <CourtMarker
              x={40}
              y={60}
              playerCount={8}
              colors={colors}
              delay={400}
            />
            <CourtMarker
              x={180}
              y={40}
              playerCount={4}
              colors={colors}
              delay={600}
            />
            <CourtMarker
              x={120}
              y={150}
              playerCount={12}
              colors={colors}
              delay={800}
            />
            <CourtMarker
              x={220}
              y={130}
              playerCount={0}
              isEmpty
              colors={colors}
              delay={1000}
            />
            <CourtMarker
              x={60}
              y={200}
              playerCount={6}
              colors={colors}
              delay={1200}
            />
          </Animated.View>

          {/* Visual label */}
          <Animated.View
            entering={FadeInUp.duration(400).delay(1400)}
            style={styles.visualLabel}>
            <View style={[styles.labelDot, {backgroundColor: colors.accent}]} />
            <Text variant="caption" color="secondary">
              Courts with players
            </Text>
            <View style={{width: spacing.md}} />
            <View style={[styles.labelDot, {backgroundColor: colors.surfaceLight}]} />
            <Text variant="caption" color="tertiary">
              Empty courts
            </Text>
          </Animated.View>
        </View>

        {/* Content Section - Takes 40% */}
        <View style={styles.contentSection}>
          <Animated.View
            entering={FadeInUp.duration(500).delay(1000)}
            style={styles.textContainer}>
            <Text variant="h1" style={styles.title}>
              Never Show Up to an{'\n'}Empty Court Again
            </Text>
            <Text
              variant="body"
              color="secondary"
              style={styles.subtitle}>
              See who's playing at every court near you — in real time.
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.duration(400).delay(1200)}
            style={styles.buttonContainer}>
            <Button
              title="Get Started"
              onPress={() => navigation.navigate('SocialProof')}
              size="lg"
            />
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
  illustrationSection: {
    alignItems: 'center',
    paddingTop: spacing.md,
  },
  mapContainer: {
    width: SCREEN_WIDTH - spacing.lg * 2,
    height: 280,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  mapLines: {
    ...StyleSheet.absoluteFillObject,
  },
  mapLine: {
    position: 'absolute',
    opacity: 0.3,
  },
  horizontalLine: {
    left: 0,
    right: 0,
    height: 1,
  },
  verticalLine: {
    top: 0,
    bottom: 0,
    width: 1,
  },
  courtMarker: {
    position: 'absolute',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 11,
    fontWeight: '600',
  },
  visualLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  labelDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.xs,
  },
  contentSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: spacing.xl,
  },
  textContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 38,
  },
  subtitle: {
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  buttonContainer: {
    width: '100%',
  },
});

export default Welcome;
