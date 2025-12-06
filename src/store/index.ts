import {configureStore} from '@reduxjs/toolkit';
import {
  useDispatch,
  useSelector as useReduxSelector,
  TypedUseSelectorHook,
} from 'react-redux';
import {persistStore} from 'redux-persist';
import {persistedAuthReducer} from './slices/authSlice';
import placesReducer from './slices/placesSlice';
import {persistedOnboardingReducer} from './slices/onboardingSlice';

const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    places: placesReducer,
    onboarding: persistedOnboardingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({serializableCheck: false}),
});

const persistor = persistStore(store);

export type StoreType = typeof store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useReduxSelector;

export {persistor, store};
