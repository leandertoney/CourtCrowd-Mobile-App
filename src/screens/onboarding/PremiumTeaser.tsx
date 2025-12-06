import React, {useEffect} from 'react';
import {StyleSheet, View, Dimensions} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {OnboardingStackParamList} from '../../navigation/OnboardingNavigation';
import {OnboardingScreen} from '../../components/onboarding';
import Button from '../../components/ui/Button';
import Text from '../../components/ui/Text';
import {useColors} from '../../contexts/ThemeContext';
import {spacing, borderRadius} from '../../utilities/theme';
import Animated, {
  FadeIn,
  FadeInUp,
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import Svg, {Path, Circle, Rect, Line} from 'react-native-svg';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

type Props = NativeStackScreenProps<OnboardingStackParamList, 'PremiumTeaser'>;

// Animated bar chart showing crowd trends
const CrowdTrendsCard: React.FC<{colors: any; delay: number}> = ({colors, delay}) => {
  const bars = [0.3, 0.5, 0.8, 1, 0.7, 0.4, 0.6];
  const labels = ['6a', '9a', '12p', '3p', '6p', '9p', '12a'];

  return (
    <Animated.View
      entering={FadeInRight.duration(500).delay(delay)}
      style={[styles.featureCard, {backgroundColor: colors.surfaceLight}]}>
      <View style={styles.cardHeader}>
        <View style={[styles.proBadgeSmall, {backgroundColor: colors.accent}]}>
          <Text variant="caption" style={{color: colors.background, fontWeight: '700', fontSize: 9}}>
            PRO
          </Text>
        </View>
        <Text variant="label" style={{fontWeight: '600'}}>
          Crowd Trends
        </Text>
      </View>
      <View style={styles.chartContainer}>
        {bars.map((height, i) => (
          <View key={i} style={styles.barColumn}>
            <View
              style={[
                styles.bar,
                {
                  height: height * 50,
                  backgroundColor: height === 1 ? colors.accent : colors.surface,
                },
              ]}
            />
            <Text variant="caption" color="tertiary" style={styles.barLabel}>
              {labels[i]}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.insightRow}>
        <View style={[styles.insightDot, {backgroundColor: colors.accent}]} />
        <Text variant="caption" color="secondary">
          Best time: 3pm today
        </Text>
      </View>
    </Animated.View>
  );
};

// Wait time estimate card
const WaitTimeCard: React.FC<{colors: any; delay: number}> = ({colors, delay}) => {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.05, {duration: 1500}),
          withTiming(1, {duration: 1500}),
        ),
        -1,
        true,
      ),
    );
  }, [delay]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{scale: pulse.value}],
  }));

  return (
    <Animated.View
      entering={FadeInRight.duration(500).delay(delay)}
      style={[styles.featureCard, styles.waitTimeCard, {backgroundColor: colors.accent}]}>
      <View style={styles.cardHeader}>
        <View style={[styles.proBadgeSmall, {backgroundColor: colors.background}]}>
          <Text variant="caption" style={{color: colors.accent, fontWeight: '700', fontSize: 9}}>
            PRO
          </Text>
        </View>
        <Text variant="label" style={{fontWeight: '600', color: colors.background}}>
          Wait Time
        </Text>
      </View>
      <Animated.View style={[styles.waitTimeDisplay, pulseStyle]}>
        <Text style={[styles.waitTimeNumber, {color: colors.background}]}>
          ~15
        </Text>
        <Text variant="label" style={{color: colors.background, opacity: 0.8}}>
          min
        </Text>
      </Animated.View>
      <Text variant="caption" style={{color: colors.background, opacity: 0.7}}>
        4 players waiting at Sunset Park
      </Text>
    </Animated.View>
  );
};

// Friend notification card
const FriendAlertCard: React.FC<{colors: any; delay: number}> = ({colors, delay}) => {
  const slide = useSharedValue(-100);

  useEffect(() => {
    slide.value = withDelay(
      delay + 300,
      withTiming(0, {duration: 600}),
    );
  }, [delay]);

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{translateX: slide.value}],
  }));

  return (
    <Animated.View
      entering={FadeInRight.duration(500).delay(delay)}
      style={[styles.featureCard, {backgroundColor: colors.surfaceLight}]}>
      <View style={styles.cardHeader}>
        <View style={[styles.proBadgeSmall, {backgroundColor: colors.accent}]}>
          <Text variant="caption" style={{color: colors.background, fontWeight: '700', fontSize: 9}}>
            PRO
          </Text>
        </View>
        <Text variant="label" style={{fontWeight: '600'}}>
          Friend Alerts
        </Text>
      </View>
      <Animated.View style={[styles.notificationMock, {backgroundColor: colors.surface}, slideStyle]}>
        <View style={[styles.notifAvatar, {backgroundColor: colors.accent}]}>
          <Text style={{color: colors.background, fontWeight: '700'}}>M</Text>
        </View>
        <View style={styles.notifContent}>
          <Text variant="bodySmall" style={{fontWeight: '600'}}>
            Mike just checked in
          </Text>
          <Text variant="caption" color="tertiary">
            Sunset Park Courts
          </Text>
        </View>
        <View style={[styles.notifBadge, {backgroundColor: colors.success}]} />
      </Animated.View>
    </Animated.View>
  );
};

const PremiumTeaser: React.FC<Props> = ({navigation}) => {
  const colors = useColors();

  return (
    <OnboardingScreen>
      <View style={styles.container}>
        {/* Premium Features Section - Takes 65% */}
        <View style={styles.featuresSection}>
          <Animated.View
            entering={FadeIn.duration(500).delay(200)}
            style={styles.headerContainer}>
            <View style={[styles.crownBadge, {backgroundColor: colors.accent}]}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M2 20h20l-2-12-5 4-3-6-3 6-5-4-2 12z"
                  fill={colors.background}
                />
              </Svg>
            </View>
            <Text variant="h2" style={styles.title}>
              Go Pro
            </Text>
            <Text variant="body" color="secondary" style={styles.subtitle}>
              Know more, wait less, play smarter
            </Text>
          </Animated.View>

          {/* Feature Cards */}
          <View style={styles.cardsContainer}>
            <CrowdTrendsCard colors={colors} delay={400} />
            <View style={styles.cardRow}>
              <WaitTimeCard colors={colors} delay={600} />
              <FriendAlertCard colors={colors} delay={800} />
            </View>
          </View>
        </View>

        {/* CTA Section - Takes 35% */}
        <View style={styles.ctaSection}>
          <Animated.View
            entering={FadeInUp.duration(400).delay(1000)}
            style={styles.trialBadge}>
            <View style={[styles.trialDot, {backgroundColor: colors.success}]} />
            <Text variant="bodySmall" style={{fontWeight: '600'}}>
              7-day free trial included
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(400).delay(1100)}>
            <Button
              title="See Plans"
              onPress={() => navigation.navigate('Paywall')}
              size="lg"
            />
          </Animated.View>

          <Animated.View
            entering={FadeInUp.duration(400).delay(1200)}
            style={styles.skipContainer}>
            <Text
              variant="bodySmall"
              color="tertiary"
              style={styles.skipText}
              onPress={() => navigation.navigate('FreeAccess')}>
              Maybe later
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
  featuresSection: {
    paddingTop: spacing.lg,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  crownBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    textAlign: 'center',
  },
  cardsContainer: {
    gap: spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  featureCard: {
    flex: 1,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
  },
  waitTimeCard: {
    maxWidth: '45%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  proBadgeSmall: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 70,
    paddingTop: spacing.sm,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 16,
    borderRadius: 8,
    minHeight: 8,
  },
  barLabel: {
    marginTop: 4,
    fontSize: 9,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  insightDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  waitTimeDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  waitTimeNumber: {
    fontSize: 42,
    fontWeight: '800',
    lineHeight: 48,
  },
  notificationMock: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  notifAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifContent: {
    flex: 1,
  },
  notifBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  ctaSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: spacing.xl,
  },
  trialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  trialDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  skipContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  skipText: {
    textDecorationLine: 'underline',
  },
});

export default PremiumTeaser;
