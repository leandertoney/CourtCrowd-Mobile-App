import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// Import onboarding screens
import Welcome from '../screens/onboarding/Welcome';
import SocialProof from '../screens/onboarding/SocialProof';
import AppDemo from '../screens/onboarding/AppDemo';
import PlayFrequency from '../screens/onboarding/PlayFrequency';
import BiggestStruggle from '../screens/onboarding/BiggestStruggle';
import CourtFindingMethod from '../screens/onboarding/CourtFindingMethod';
import HeardAboutUs from '../screens/onboarding/HeardAboutUs';
import FeatureBenefits from '../screens/onboarding/FeatureBenefits';
import PersonalizedReinforcement from '../screens/onboarding/PersonalizedReinforcement';
import PremiumTeaser from '../screens/onboarding/PremiumTeaser';
import Paywall from '../screens/onboarding/Paywall';
import LastChanceOffer from '../screens/onboarding/LastChanceOffer';
import FreeAccess from '../screens/onboarding/FreeAccess';

export type OnboardingStackParamList = {
  Welcome: undefined;
  SocialProof: undefined;
  AppDemo: undefined;
  PlayFrequency: undefined;
  BiggestStruggle: undefined;
  CourtFindingMethod: undefined;
  HeardAboutUs: undefined;
  FeatureBenefits: undefined;
  PersonalizedReinforcement: undefined;
  PremiumTeaser: undefined;
  Paywall: undefined;
  LastChanceOffer: undefined;
  FreeAccess: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

const OnboardingStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        animationDuration: 300,
        gestureEnabled: false,
      }}>
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="SocialProof" component={SocialProof} />
      <Stack.Screen name="AppDemo" component={AppDemo} />
      <Stack.Screen name="PlayFrequency" component={PlayFrequency} />
      <Stack.Screen name="BiggestStruggle" component={BiggestStruggle} />
      <Stack.Screen name="CourtFindingMethod" component={CourtFindingMethod} />
      <Stack.Screen name="HeardAboutUs" component={HeardAboutUs} />
      <Stack.Screen name="FeatureBenefits" component={FeatureBenefits} />
      <Stack.Screen
        name="PersonalizedReinforcement"
        component={PersonalizedReinforcement}
      />
      <Stack.Screen name="PremiumTeaser" component={PremiumTeaser} />
      <Stack.Screen name="Paywall" component={Paywall} />
      <Stack.Screen name="LastChanceOffer" component={LastChanceOffer} />
      <Stack.Screen name="FreeAccess" component={FreeAccess} />
    </Stack.Navigator>
  );
};

export default OnboardingStackNavigator;
