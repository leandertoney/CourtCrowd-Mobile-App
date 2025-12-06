import React from 'react';
import {StyleSheet, View, Dimensions} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {OnboardingStackParamList} from '../../navigation/OnboardingNavigation';
import {OnboardingScreen} from '../../components/onboarding';
import Button from '../../components/ui/Button';
import Text from '../../components/ui/Text';
import {useColors} from '../../contexts/ThemeContext';
import {spacing, borderRadius} from '../../utilities/theme';
import Animated, {FadeIn, FadeInUp, FadeInRight} from 'react-native-reanimated';
import Svg, {Path, Circle, Rect} from 'react-native-svg';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

type Props = NativeStackScreenProps<OnboardingStackParamList, 'FeatureBenefits'>;

// Icons
const LocationIcon: React.FC<{color: string; size?: number}> = ({color, size = 24}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
      stroke={color}
      strokeWidth="2"
      fill={color}
      fillOpacity={0.2}
    />
    <Circle cx="12" cy="10" r="3" fill={color} />
  </Svg>
);

const PeopleIcon: React.FC<{color: string; size?: number}> = ({color, size = 24}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="9" cy="7" r="4" fill={color} />
    <Path d="M2 21v-2a4 4 0 014-4h6a4 4 0 014 4v2" fill={color} fillOpacity={0.3} />
    <Circle cx="17" cy="9" r="3" stroke={color} strokeWidth="2" />
    <Path d="M21 21v-2a3 3 0 00-3-3h-1" stroke={color} strokeWidth="2" />
  </Svg>
);

const MapIcon: React.FC<{color: string; size?: number}> = ({color, size = 24}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z"
      stroke={color}
      strokeWidth="2"
      fill={color}
      fillOpacity={0.1}
    />
    <Path d="M8 2v16M16 6v16" stroke={color} strokeWidth="2" />
  </Svg>
);

const BellIcon: React.FC<{color: string; size?: number}> = ({color, size = 24}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"
      stroke={color}
      strokeWidth="2"
      fill={color}
      fillOpacity={0.2}
    />
    <Path d="M13.73 21a2 2 0 01-3.46 0" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="18" cy="4" r="3" fill={color} />
  </Svg>
);

const ClockIcon: React.FC<{color: string; size?: number}> = ({color, size = 24}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill={color} fillOpacity={0.1} />
    <Path d="M12 6v6l4 2" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const TrendIcon: React.FC<{color: string; size?: number}> = ({color, size = 24}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 17l6-6 4 4 8-8"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path d="M17 7h4v4" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const FREE_FEATURES = [
  {Icon: LocationIcon, title: 'Live court activity'},
  {Icon: PeopleIcon, title: 'Player counts'},
  {Icon: MapIcon, title: 'Interactive map'},
];

const PREMIUM_FEATURES = [
  {Icon: BellIcon, title: 'Get notified when friends arrive'},
  {Icon: ClockIcon, title: 'See estimated wait times'},
  {Icon: TrendIcon, title: 'Find the best times to play'},
];

// Feature Row Component
const FeatureRow: React.FC<{
  feature: {Icon: React.FC<{color: string; size?: number}>; title: string};
  isPremium?: boolean;
  delay: number;
  colors: any;
}> = ({feature, isPremium, delay, colors}) => {
  const Icon = feature.Icon;

  return (
    <Animated.View
      entering={FadeInRight.duration(400).delay(delay)}
      style={[
        styles.featureRow,
        {backgroundColor: isPremium ? colors.accent + '15' : colors.surfaceLight},
      ]}>
      <View
        style={[
          styles.iconContainer,
          {backgroundColor: isPremium ? colors.accent : colors.surface},
        ]}>
        <Icon color={isPremium ? colors.background : colors.accent} size={20} />
      </View>
      <Text
        variant="body"
        style={{
          flex: 1,
          color: colors.text.primary,
          fontWeight: isPremium ? '600' : '400',
        }}>
        {feature.title}
      </Text>
      {isPremium && (
        <View style={[styles.proBadge, {backgroundColor: colors.accent}]}>
          <Text variant="caption" style={{color: colors.background, fontWeight: '700', fontSize: 10}}>
            PRO
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

const FeatureBenefits: React.FC<Props> = ({navigation}) => {
  const colors = useColors();

  return (
    <OnboardingScreen>
      <View style={styles.container}>
        {/* Features Section - Takes 65% */}
        <View style={styles.featuresSection}>
          <Animated.View
            entering={FadeIn.duration(500).delay(200)}
            style={styles.headerContainer}>
            <Text variant="h2" style={styles.title}>
              What You Get
            </Text>
            <Text variant="body" color="secondary" style={styles.subtitle}>
              All the info you need, right when you need it
            </Text>
          </Animated.View>

          {/* Free Features */}
          <Animated.View
            entering={FadeInUp.duration(400).delay(300)}
            style={styles.sectionHeader}>
            <View style={[styles.sectionBadge, {backgroundColor: colors.surfaceLight}]}>
              <Text variant="label" color="secondary">
                FREE
              </Text>
            </View>
          </Animated.View>
          <View style={styles.featuresList}>
            {FREE_FEATURES.map((feature, index) => (
              <FeatureRow
                key={feature.title}
                feature={feature}
                delay={400 + index * 100}
                colors={colors}
              />
            ))}
          </View>

          {/* Premium Features */}
          <Animated.View
            entering={FadeInUp.duration(400).delay(700)}
            style={styles.sectionHeader}>
            <View style={[styles.sectionBadge, {backgroundColor: colors.accent}]}>
              <Text variant="label" style={{color: colors.background}}>
                PRO
              </Text>
            </View>
          </Animated.View>
          <View style={styles.featuresList}>
            {PREMIUM_FEATURES.map((feature, index) => (
              <FeatureRow
                key={feature.title}
                feature={feature}
                isPremium
                delay={800 + index * 100}
                colors={colors}
              />
            ))}
          </View>
        </View>

        {/* CTA Section - Takes 35% */}
        <View style={styles.ctaSection}>
          <Animated.View
            entering={FadeInUp.duration(400).delay(1100)}
            style={styles.promoContainer}>
            <Text variant="bodySmall" color="tertiary" style={styles.promoText}>
              Try Pro free for 7 days
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(400).delay(1200)}>
            <Button
              title="Show Me More"
              onPress={() => navigation.navigate('PersonalizedReinforcement')}
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
  featuresSection: {
    paddingTop: spacing.lg,
  },
  headerContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  sectionBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  featuresList: {
    gap: spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  ctaSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: spacing.xl,
  },
  promoContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  promoText: {
    textAlign: 'center',
  },
});

export default FeatureBenefits;
