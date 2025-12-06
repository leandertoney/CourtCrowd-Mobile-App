import React, {useEffect} from 'react';
import {StyleSheet, View, Dimensions} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {OnboardingStackParamList} from '../../navigation/OnboardingNavigation';
import {OnboardingScreen} from '../../components/onboarding';
import Button from '../../components/ui/Button';
import Text from '../../components/ui/Text';
import {useAppSelector} from '../../store';
import {useColors} from '../../contexts/ThemeContext';
import {spacing, borderRadius} from '../../utilities/theme';
import Animated, {
  FadeIn,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import Svg, {Path, Circle} from 'react-native-svg';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

type Props = NativeStackScreenProps<
  OnboardingStackParamList,
  'PersonalizedReinforcement'
>;

// Icons for each struggle type
const EmptyCourtIcon: React.FC<{color: string; size?: number}> = ({color, size = 48}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
      fill={color}
    />
    <Circle cx="12" cy="10" r="3" fill="white" />
  </Svg>
);

const CrowdedIcon: React.FC<{color: string; size?: number}> = ({color, size = 48}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="8" cy="7" r="3" fill={color} />
    <Circle cx="16" cy="7" r="3" fill={color} />
    <Circle cx="12" cy="14" r="3" fill={color} />
    <Path d="M2 21c0-4 3-6 6-6M16 15c3 0 6 2 6 6" stroke={color} strokeWidth="2" />
  </Svg>
);

const PlayersIcon: React.FC<{color: string; size?: number}> = ({color, size = 48}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="5" fill={color} />
    <Path d="M3 21v-2a6 6 0 016-6h6a6 6 0 016 6v2" fill={color} fillOpacity={0.5} />
    <Path d="M16 11l2 2 4-4" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const AllIcon: React.FC<{color: string; size?: number}> = ({color, size = 48}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill={color} />
    <Path d="M8 12l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const DefaultIcon: React.FC<{color: string; size?: number}> = ({color, size = 48}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill={color} fillOpacity={0.2} />
    <Path d="M12 6v6l4 2" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const REINFORCEMENT_MESSAGES: Record<string, {title: string; message: string; Icon: React.FC<{color: string; size?: number}>}> = {
  courts_empty: {
    title: 'No More Empty Courts',
    message: "You'll see exactly how many players are at every court before you leave home.",
    Icon: EmptyCourtIcon,
  },
  courts_crowded: {
    title: 'Skip the Crowds',
    message: "You'll find courts with the perfect amount of activity — no more waiting in line.",
    Icon: CrowdedIcon,
  },
  find_players: {
    title: 'Find Your People',
    message: "You'll see who's at each court and find players who match your style.",
    Icon: PlayersIcon,
  },
  coordinate: {
    title: 'Easier Meetups',
    message: "No more texting back and forth. Just check the app and go.",
    Icon: PlayersIcon,
  },
  dont_know_where: {
    title: 'Discover the Action',
    message: "You'll always know exactly where players are gathering in your area.",
    Icon: EmptyCourtIcon,
  },
  all: {
    title: "We've Got You Covered",
    message: "Empty courts, crowded courts, finding players — we solve it all.",
    Icon: AllIcon,
  },
};

const DEFAULT_MESSAGE = {
  title: 'Play Smarter',
  message: "You'll find the best courts with the right amount of activity.",
  Icon: DefaultIcon,
};

const PersonalizedReinforcement: React.FC<Props> = ({navigation}) => {
  const colors = useColors();
  const primaryStruggle = useAppSelector(
    state => state.onboarding.primaryStruggle,
  );

  const content = REINFORCEMENT_MESSAGES[primaryStruggle || ''] || DEFAULT_MESSAGE;
  const Icon = content.Icon;

  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.05, {duration: 1000}),
        withTiming(1, {duration: 1000}),
      ),
      -1,
      true,
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{scale: pulse.value}],
  }));

  return (
    <OnboardingScreen>
      <View style={styles.container}>
        {/* Reinforcement Section - Takes 60% */}
        <View style={styles.reinforcementSection}>
          <Animated.View
            entering={FadeIn.duration(600).delay(200)}
            style={styles.iconContainer}>
            <Animated.View style={[styles.iconBackground, {backgroundColor: colors.accent + '20'}, pulseStyle]}>
              <Icon color={colors.accent} size={56} />
            </Animated.View>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.duration(500).delay(400)}
            style={styles.textContainer}>
            <Text variant="h1" style={styles.title}>
              {content.title}
            </Text>
            <Text variant="body" color="secondary" style={styles.message}>
              {content.message}
            </Text>
          </Animated.View>

          {/* Visual confirmation */}
          <Animated.View
            entering={FadeInUp.duration(400).delay(600)}
            style={[styles.confirmationCard, {backgroundColor: colors.surfaceLight}]}>
            <View style={[styles.confirmDot, {backgroundColor: colors.success}]} />
            <Text variant="bodySmall" color="secondary">
              Personalized just for you
            </Text>
          </Animated.View>
        </View>

        {/* CTA Section - Takes 40% */}
        <View style={styles.ctaSection}>
          <Animated.View entering={FadeInUp.duration(400).delay(800)}>
            <Button
              title="Show Me How"
              onPress={() => navigation.navigate('PremiumTeaser')}
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
  reinforcementSection: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  message: {
    textAlign: 'center',
    lineHeight: 26,
  },
  confirmationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  confirmDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  ctaSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: spacing.xl,
  },
});

export default PersonalizedReinforcement;
