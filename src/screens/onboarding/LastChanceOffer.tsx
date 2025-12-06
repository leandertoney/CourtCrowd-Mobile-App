import React, {useState} from 'react';
import {StyleSheet, View, TouchableOpacity, Alert} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {OnboardingStackParamList} from '../../navigation/OnboardingNavigation';
import {OnboardingScreen, AnimatedTitle} from '../../components/onboarding';
import Button from '../../components/ui/Button';
import Text from '../../components/ui/Text';
import {useColors} from '../../contexts/ThemeContext';
import {spacing, borderRadius} from '../../utilities/theme';
import Animated, {FadeInUp} from 'react-native-reanimated';
import Svg, {Path} from 'react-native-svg';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'LastChanceOffer'>;

// =============================================================================
// ICONS
// =============================================================================

const GiftIcon: React.FC<{color: string; size?: number}> = ({color, size = 48}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 110-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 100-5C13 2 12 7 12 7z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CheckIcon: React.FC<{color: string}> = ({color}) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6L9 17l-5-5"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// =============================================================================
// COMPONENT
// =============================================================================

const LastChanceOffer: React.FC<Props> = ({navigation}) => {
  const colors = useColors();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartTrial = async () => {
    setIsLoading(true);
    // Placeholder: Would integrate with RevenueCat for free trial
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Coming Soon',
        'Free trial subscriptions will be available soon. Enjoy the free features for now!',
        [{text: 'Continue', onPress: () => navigation.navigate('FreeAccess')}],
      );
    }, 1000);
  };

  const handleSkip = () => {
    navigation.navigate('FreeAccess');
  };

  const benefits = [
    'Live crowd trends',
    'Wait time estimates',
    'Advanced notifications',
    'Skill-level insights',
  ];

  return (
    <OnboardingScreen>
      <View style={styles.content}>
        {/* Icon */}
        <Animated.View
          entering={FadeInUp.duration(400)}
          style={styles.iconContainer}>
          <View style={[styles.iconCircle, {backgroundColor: `${colors.accent}20`}]}>
            <GiftIcon color={colors.accent} />
          </View>
        </Animated.View>

        {/* Title */}
        <AnimatedTitle
          title="Try Premium FREE"
          subtitle="Experience all premium features for 7 days before you decide."
        />

        {/* Benefits Card */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(200)}
          style={[styles.benefitsCard, {backgroundColor: colors.surfaceLight}]}>
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitRow}>
              <View style={[styles.checkCircle, {backgroundColor: colors.success}]}>
                <CheckIcon color="#fff" />
              </View>
              <Text variant="body" color="secondary">
                {benefit}
              </Text>
            </View>
          ))}
        </Animated.View>

        {/* Terms */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(400)}
          style={styles.termsContainer}>
          <Text variant="bodySmall" color="tertiary" style={styles.termsText}>
            After your 7-day trial: $9.99/month
          </Text>
          <Text variant="caption" color="tertiary" style={styles.termsSubtext}>
            Cancel anytime during your trial • No charge until trial ends
          </Text>
        </Animated.View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title={isLoading ? 'Processing...' : 'Start Free Trial'}
          onPress={handleStartTrial}
          disabled={isLoading}
          loading={isLoading}
          size="lg"
        />
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text variant="label" color="tertiary">
            No thanks, continue with free
          </Text>
        </TouchableOpacity>
      </View>
    </OnboardingScreen>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitsCard: {
    width: '100%',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  termsContainer: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  termsText: {
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  termsSubtext: {
    textAlign: 'center',
  },
  footer: {
    paddingTop: spacing.md,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
});

export default LastChanceOffer;
