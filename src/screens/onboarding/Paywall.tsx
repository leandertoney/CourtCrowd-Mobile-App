import React, {useState} from 'react';
import {StyleSheet, View, TouchableOpacity, Alert} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {OnboardingStackParamList} from '../../navigation/OnboardingNavigation';
import {
  OnboardingScreen,
  AnimatedTitle,
  PlanCard,
} from '../../components/onboarding';
import Button from '../../components/ui/Button';
import Text from '../../components/ui/Text';
import {useAppDispatch} from '../../store';
import {setSelectedPlan} from '../../store/slices/onboardingSlice';
import {useColors} from '../../contexts/ThemeContext';
import {spacing, borderRadius} from '../../utilities/theme';
import Animated, {FadeInUp} from 'react-native-reanimated';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Paywall'>;

const Paywall: React.FC<Props> = ({navigation}) => {
  const colors = useColors();
  const dispatch = useAppDispatch();
  const [selectedPlanType, setSelectedPlanType] = useState<
    'monthly' | 'annual'
  >('annual');
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectPlan = (plan: 'monthly' | 'annual') => {
    setSelectedPlanType(plan);
    dispatch(setSelectedPlan(plan));
  };

  const handleSubscribe = async () => {
    setIsLoading(true);

    // Placeholder: In real implementation, this would call RevenueCat
    // For now, just simulate a purchase flow
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Coming Soon',
        'Premium subscriptions will be available in a future update. Enjoy the free features for now!',
        [
          {
            text: 'Continue',
            onPress: () => navigation.navigate('FreeAccess'),
          },
        ],
      );
    }, 1000);
  };

  const handleRestorePurchases = () => {
    Alert.alert(
      'Restore Purchases',
      'No previous purchases found.',
      [{text: 'OK'}],
    );
  };

  const handleSkip = () => {
    navigation.navigate('LastChanceOffer');
  };

  return (
    <OnboardingScreen>
      <View style={styles.content}>
        <AnimatedTitle
          title="Play Smarter"
          subtitle="Unlock premium features to never miss the action."
        />

        <Animated.View
          entering={FadeInUp.duration(400).delay(200)}
          style={styles.plansContainer}>
          <PlanCard
            title="Annual"
            price="$39.99"
            period="year"
            savings="Save 67%"
            selected={selectedPlanType === 'annual'}
            recommended
            onSelect={() => handleSelectPlan('annual')}
          />
          <PlanCard
            title="Monthly"
            price="$9.99"
            period="month"
            selected={selectedPlanType === 'monthly'}
            onSelect={() => handleSelectPlan('monthly')}
          />
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(400).delay(400)}
          style={[styles.benefitsContainer, {backgroundColor: colors.surfaceLight}]}>
          <Text variant="label" style={styles.benefitsTitle}>Premium includes:</Text>
          <Text variant="body" color="secondary" style={styles.benefit}>• Live crowd trends</Text>
          <Text variant="body" color="secondary" style={styles.benefit}>• Wait time estimates</Text>
          <Text variant="body" color="secondary" style={styles.benefit}>• Advanced notifications</Text>
          <Text variant="body" color="secondary" style={styles.benefit}>• Skill-level insights</Text>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <Button
          title={isLoading ? 'Processing...' : 'Subscribe'}
          onPress={handleSubscribe}
          disabled={isLoading}
          loading={isLoading}
          size="lg"
        />

        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestorePurchases}>
          <Text variant="label" color="secondary">Restore purchases</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text variant="caption" color="tertiary">Maybe later</Text>
        </TouchableOpacity>
      </View>
    </OnboardingScreen>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  plansContainer: {
    marginTop: spacing.xl,
  },
  benefitsContainer: {
    marginTop: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  benefitsTitle: {
    marginBottom: spacing.md,
  },
  benefit: {
    marginBottom: spacing.sm,
  },
  footer: {
    paddingTop: spacing.md,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
});

export default Paywall;
