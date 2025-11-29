import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import HomeStackNavigator from './HomeNavigation';
import {useAppDispatch} from '../store';
import AuthStackNavigator from './AuthNavigation';
import {setCurrentLocationAction, setUserAction} from '../store/slices/authSlice';
import {Session} from '@supabase/supabase-js';
import {supabase} from '../lib/supabase';
import {
  getCurrentLocation,
  startLocationTracking,
} from '../services/location';

interface NavigationProps {
  session: Session | null;
}

const Navigation = ({session}: NavigationProps) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (session?.user) {
      // Fetch user profile and set in Redux
      fetchUserProfile(session.user.id);
      // Get current location
      initializeLocation();
    }
  }, [session?.user?.id]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const {data, error} = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        dispatch(
          setUserAction({
            id: data.id,
            email: data.email,
            name: data.name || '',
            nickName: data.nickname || '',
            photo: data.avatar_url ? {url: data.avatar_url, path: ''} : undefined,
            skill: data.skill_level || '',
            playHours: data.play_hours || '',
            dupr: data.dupr || '',
            bio: data.bio || '',
            address: '',
            notifications: true,
            pushNotifications: true,
            messaging: true,
          }),
        );
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const initializeLocation = async () => {
    try {
      const location = await getCurrentLocation();
      if (location) {
        dispatch(
          setCurrentLocationAction({
            coords: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              altitude: location.coords.altitude || 0,
              accuracy: location.coords.accuracy || 0,
              altitudeAccuracy: location.coords.altitudeAccuracy || 0,
              heading: location.coords.heading || 0,
              speed: location.coords.speed || 0,
            },
            timestamp: location.timestamp,
          }),
        );
      }

      // Start background location tracking
      await startLocationTracking();
    } catch (error) {
      console.error('Error initializing location:', error);
    }
  };

  return (
    <NavigationContainer>
      {session?.user ? <HomeStackNavigator /> : <AuthStackNavigator />}
    </NavigationContainer>
  );
};

export default Navigation;
