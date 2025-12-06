import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {OnboardingStackParamList} from '../../navigation/OnboardingNavigation';
import {OnboardingScreen} from '../../components/onboarding';
import Button from '../../components/ui/Button';
import Text from '../../components/ui/Text';
import {useColors} from '../../contexts/ThemeContext';
import {spacing, borderRadius} from '../../utilities/theme';
import Animated, {FadeIn, FadeInUp} from 'react-native-reanimated';
import Svg, {Path} from 'react-native-svg';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'SocialProof'>;

const StarIcon: React.FC<{color: string}> = ({color}) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      fill={color}
    />
  </Svg>
);

const TESTIMONIALS = [
  {
    quote: 'I used to waste 30 minutes driving around. Now I know exactly where to go.',
    author: 'Mike R.',
    location: 'Phoenix, AZ',
  },
  {
    quote: 'Game changer! Finally plan my sessions around when courts are actually open.',
    author: 'Sarah T.',
    location: 'Austin, TX',
  },
];

const SocialProof: React.FC<Props> = ({navigation}) => {
  const colors = useColors();

  return (
    <OnboardingScreen>
      <View style={styles.container}>
        {/* Stats */}
        <Animated.View
          entering={FadeIn.duration(500).delay(200)}
          style={[styles.statsRow, {backgroundColor: colors.surfaceLight}]}>
          <View style={styles.statItem}>
            <Text variant="h2" style={{color: colors.accent}}>10K+</Text>
            <Text variant="caption" color="secondary">Players</Text>
          </View>
          <View style={[styles.statDivider, {backgroundColor: colors.border}]} />
          <View style={styles.statItem}>
            <Text variant="h2" style={{color: colors.accent}}>500+</Text>
            <Text variant="caption" color="secondary">Courts</Text>
          </View>
          <View style={[styles.statDivider, {backgroundColor: colors.border}]} />
          <View style={styles.statItem}>
            <View style={styles.ratingRow}>
              <Text variant="h2" style={{color: colors.accent}}>4.9</Text>
              <StarIcon color={colors.accent} />
            </View>
            <Text variant="caption" color="secondary">Rating</Text>
          </View>
        </Animated.View>

        {/* Testimonials */}
        <View style={styles.testimonials}>
          {TESTIMONIALS.map((t, i) => (
            <Animated.View
              key={i}
              entering={FadeInUp.duration(400).delay(400 + i * 150)}
              style={[styles.testimonialCard, {backgroundColor: colors.surfaceLight}]}>
              <View style={styles.starsRow}>
                {[...Array(5)].map((_, j) => (
                  <StarIcon key={j} color={colors.accent} />
                ))}
              </View>
              <Text variant="body" style={styles.quote}>"{t.quote}"</Text>
              <Text variant="caption" color="secondary">— {t.author}, {t.location}</Text>
            </Animated.View>
          ))}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Animated.View entering={FadeInUp.duration(500).delay(800)}>
            <Text variant="h2" style={styles.title}>Players Love It</Text>
            <Text variant="body" color="secondary" style={styles.subtitle}>
              Real feedback from players who stopped guessing.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(400).delay(1000)}>
            <Button
              title="I'm In"
              onPress={() => navigation.navigate('AppDemo')}
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
  statsRow: {
    flexDirection: 'row',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    alignSelf: 'stretch',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  testimonials: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  testimonialCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: spacing.sm,
  },
  quote: {
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: spacing.sm,
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
  },
});

export default SocialProof;
