import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import persistReducer from 'redux-persist/es/persistReducer';

// Types for onboarding responses
export type PlayFrequency =
  | 'once_week'
  | '2_3_week'
  | '4_plus_week'
  | 'just_starting'
  | null;

export type PrimaryStruggle =
  | 'courts_empty'
  | 'courts_crowded'
  | 'find_players'
  | 'coordinate'
  | 'dont_know_where'
  | 'all'
  | null;

export type CourtFindingMethod =
  | 'drive_around'
  | 'group_chat'
  | 'word_of_mouth'
  | 'random_guess'
  | 'hope'
  | null;

export type HeardAboutUs =
  | 'tiktok'
  | 'instagram'
  | 'friend'
  | 'facebook'
  | 'reddit'
  | 'courts'
  | 'other'
  | null;

export interface OnboardingState {
  hasCompletedOnboarding: boolean;
  playFrequency: PlayFrequency;
  primaryStruggle: PrimaryStruggle;
  courtFindingMethod: CourtFindingMethod;
  heardAboutUs: HeardAboutUs;
  searchRadius: number;
  completedAt: string | null;
  // Premium state (placeholder for now)
  isPremium: boolean;
  selectedPlan: 'weekly' | 'annual' | null;
}

const initialState: OnboardingState = {
  hasCompletedOnboarding: false,
  playFrequency: null,
  primaryStruggle: null,
  courtFindingMethod: null,
  heardAboutUs: null,
  searchRadius: 10,
  completedAt: null,
  isPremium: false,
  selectedPlan: null,
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setPlayFrequency: (state, action: PayloadAction<PlayFrequency>) => {
      state.playFrequency = action.payload;
    },
    setPrimaryStruggle: (state, action: PayloadAction<PrimaryStruggle>) => {
      state.primaryStruggle = action.payload;
    },
    setCourtFindingMethod: (
      state,
      action: PayloadAction<CourtFindingMethod>,
    ) => {
      state.courtFindingMethod = action.payload;
    },
    setHeardAboutUs: (state, action: PayloadAction<HeardAboutUs>) => {
      state.heardAboutUs = action.payload;
    },
    setSearchRadius: (state, action: PayloadAction<number>) => {
      state.searchRadius = action.payload;
    },
    completeOnboarding: state => {
      state.hasCompletedOnboarding = true;
      state.completedAt = new Date().toISOString();
    },
    setSelectedPlan: (
      state,
      action: PayloadAction<'weekly' | 'annual' | null>,
    ) => {
      state.selectedPlan = action.payload;
    },
    setPremiumStatus: (state, action: PayloadAction<boolean>) => {
      state.isPremium = action.payload;
    },
    resetOnboarding: () => initialState,
  },
});

export const {
  setPlayFrequency,
  setPrimaryStruggle,
  setCourtFindingMethod,
  setHeardAboutUs,
  setSearchRadius,
  completeOnboarding,
  setSelectedPlan,
  setPremiumStatus,
  resetOnboarding,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;

// Persist onboarding state
const persistConfig = {
  key: 'onboarding',
  storage: AsyncStorage,
  whitelist: [
    'hasCompletedOnboarding',
    'playFrequency',
    'primaryStruggle',
    'courtFindingMethod',
    'heardAboutUs',
    'searchRadius',
    'completedAt',
    'isPremium',
  ],
};

export const persistedOnboardingReducer = persistReducer(
  persistConfig,
  onboardingSlice.reducer,
);
