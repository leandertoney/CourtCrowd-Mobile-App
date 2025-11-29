import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {IUser} from '../../interfaces/IUser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import persistReducer from 'redux-persist/es/persistReducer';

// Location type compatible with Expo Location
interface LocationCoords {
  latitude: number;
  longitude: number;
  altitude: number;
  accuracy: number;
  altitudeAccuracy: number;
  heading: number;
  speed: number;
}

interface LocationResponse {
  coords: LocationCoords;
  timestamp: number;
}

interface AuthState {
  user: IUser | null;
  currentLocation: LocationResponse | null;
}

const initialState: AuthState = {
  user: null,
  currentLocation: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserAction: (state, action: PayloadAction<IUser>) => {
      state.user = action.payload;
    },

    updateUserAction: (state, action: PayloadAction<Partial<IUser>>) => {
      if (state.user) {
        state.user = {...state.user, ...action.payload};
      }
    },

    setCurrentLocationAction: (
      state,
      action: PayloadAction<LocationResponse>,
    ) => {
      state.currentLocation = action.payload;
    },

    logout: state => {
      state.user = null;
      state.currentLocation = null;
    },
  },
});

export const {
  logout,
  setUserAction,
  updateUserAction,
  setCurrentLocationAction,
} = authSlice.actions;
export default authSlice.reducer;

// Persist user state
const persistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  whitelist: ['user'], // Only persist the user
};

export const persistedAuthReducer = persistReducer(
  persistConfig,
  authSlice.reducer,
);
