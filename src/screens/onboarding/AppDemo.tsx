import React from 'react';
import {StyleSheet, View, Dimensions} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {OnboardingStackParamList} from '../../navigation/OnboardingNavigation';
import {OnboardingScreen} from '../../components/onboarding';
import Button from '../../components/ui/Button';
import Text from '../../components/ui/Text';
import {useColors} from '../../contexts/ThemeContext';
import {spacing, borderRadius} from '../../utilities/theme';
import Animated, {FadeIn, FadeInUp} from 'react-native-reanimated';
import Svg, {Path, Circle} from 'react-native-svg';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

type Props = NativeStackScreenProps<OnboardingStackParamList, 'AppDemo'>;

const PersonIcon: React.FC<{color: string}> = ({color}) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="4" fill={color} />
    <Path d="M20 21a8 8 0 10-16 0" fill={color} />
  </Svg>
);

// Player count indicator
const PlayerIndicator: React.FC<{
  x: number;
  y: number;
  count: number;
  name: string;
  isHot?: boolean;
  isEmpty?: boolean;
  colors: any;
}> = ({x, y, count, name, isHot, isEmpty, colors}) => (
  <View style={[styles.indicator, {left: x, top: y}]}>
    <View
      style={[
        styles.indicatorBubble,
        {backgroundColor: isEmpty ? colors.surfaceLight : isHot ? colors.accent : colors.surface},
      ]}>
      {!isEmpty && <PersonIcon color={isHot ? colors.background : colors.text.secondary} />}
      <Text
        variant="caption"
        style={{
          color: isEmpty ? colors.text.tertiary : isHot ? colors.background : colors.text.primary,
          fontWeight: '700',
        }}>
        {count}
      </Text>
    </View>
    <Text variant="caption" color="tertiary" style={styles.courtName}>
      {name}
    </Text>
  </View>
);

const AppDemo: React.FC<Props> = ({navigation}) => {
  const colors = useColors();

  return (
    <OnboardingScreen>
      <View style={styles.container}>
        {/* Phone mockup */}
        <Animated.View
          entering={FadeIn.duration(600).delay(200)}
          style={[styles.phoneMockup, {backgroundColor: colors.surfaceLight}]}>
          {/* Notch */}
          <View style={[styles.notch, {backgroundColor: colors.background}]} />

          {/* Map area */}
          <View style={[styles.mapArea, {backgroundColor: colors.surface}]}>
            {/* Grid lines */}
            {[...Array(5)].map((_, i) => (
              <View
                key={`h-${i}`}
                style={[styles.gridLine, {top: `${20 + i * 16}%`, backgroundColor: colors.border}]}
              />
            ))}

            {/* Player indicators */}
            <PlayerIndicator x={30} y={30} count={12} name="Sunset Park" isHot colors={colors} />
            <PlayerIndicator x={150} y={60} count={6} name="Rec Center" colors={colors} />
            <PlayerIndicator x={70} y={130} count={4} name="Oak Street" colors={colors} />
            <PlayerIndicator x={170} y={160} count={0} name="City Courts" isEmpty colors={colors} />

            {/* User location */}
            <View style={[styles.userDot, {left: 110, top: 100, backgroundColor: colors.accent}]}>
              <View style={[styles.userDotInner, {backgroundColor: colors.background}]} />
            </View>
          </View>

          {/* Live badge */}
          <View style={[styles.liveBadge, {backgroundColor: colors.surfaceLight}]}>
            <View style={[styles.liveDot, {backgroundColor: colors.success}]} />
            <Text variant="caption" style={{fontWeight: '600'}}>Live</Text>
          </View>
        </Animated.View>

        {/* Content */}
        <View style={styles.content}>
          <Animated.View entering={FadeInUp.duration(500).delay(600)}>
            <Text variant="h1" style={styles.title}>See Who's There</Text>
            <Text variant="body" color="secondary" style={styles.subtitle}>
              Check player counts at every court before you head out.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(400).delay(800)}>
            <Button
              title="Nice!"
              onPress={() => navigation.navigate('PlayFrequency')}
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
  phoneMockup: {
    height: 320,
    borderRadius: borderRadius.xl,
    marginTop: spacing.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  notch: {
    position: 'absolute',
    top: 8,
    left: '50%',
    marginLeft: -35,
    width: 70,
    height: 20,
    borderRadius: 10,
    zIndex: 10,
  },
  mapArea: {
    flex: 1,
    marginTop: 36,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    opacity: 0.2,
  },
  indicator: {
    position: 'absolute',
    alignItems: 'center',
  },
  indicatorBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  courtName: {
    marginTop: 4,
    fontSize: 10,
  },
  userDot: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveBadge: {
    position: 'absolute',
    top: 44,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: spacing.xl,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
});

export default AppDemo;
