/**
 * Radar Geofencing Hook
 * Manages automatic check-in/check-out based on location
 */

import {useEffect, useState, useCallback, useRef} from 'react';
import {AppState, AppStateStatus, Alert} from 'react-native';
import {useSelector} from 'react-redux';
import {RootState} from '../store';
import {
  initializeRadar,
  requestLocationPermissions,
  getPermissionStatus,
  setUserId,
  startTracking,
  stopTracking,
  trackOnce,
  onGeofenceEvent,
  checkInViaRadar,
  checkOutViaRadar,
  getActiveCheckIn,
  isRadarAvailable,
  GeofenceEvent,
} from '../services/radarGeofencing';

export interface GeofencingState {
  initialized: boolean;
  tracking: boolean;
  permissionStatus: string;
  activeCheckIn: {courtId: string; enteredAt: string} | null;
  lastEvent: GeofenceEvent | null;
}

interface UseRadarGeofencingOptions {
  autoStart?: boolean;
  showAlerts?: boolean;
}

export function useRadarGeofencing(options: UseRadarGeofencingOptions = {}) {
  const {autoStart = true, showAlerts = true} = options;

  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.id;

  const [state, setState] = useState<GeofencingState>({
    initialized: false,
    tracking: false,
    permissionStatus: 'UNKNOWN',
    activeCheckIn: null,
    lastEvent: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initRef = useRef(false);
  const appStateRef = useRef(AppState.currentState);

  // Initialize Radar on mount
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const init = async () => {
      try {
        setLoading(true);

        // Check if Radar SDK is available (requires dev build, not Expo Go)
        if (!isRadarAvailable()) {
          console.log('[useRadarGeofencing] Radar SDK not available (requires development build)');
          // Don't set error - this is expected in Expo Go
          // Just mark as "initialized" with limited functionality
          setState(prev => ({
            ...prev,
            initialized: false,
            permissionStatus: 'UNAVAILABLE',
          }));
          return;
        }

        // Initialize SDK
        const initialized = await initializeRadar();
        if (!initialized) {
          setError('Failed to initialize Radar SDK');
          return;
        }

        // Check permission status
        const permStatus = await getPermissionStatus();

        setState(prev => ({
          ...prev,
          initialized: true,
          permissionStatus: permStatus,
        }));

        // Set user ID if available
        if (userId) {
          setUserId(userId);

          // Check for active check-in
          const activeCheckIn = await getActiveCheckIn(userId);
          setState(prev => ({...prev, activeCheckIn}));
        }

        // Auto-start tracking if permissions granted
        if (
          autoStart &&
          (permStatus === 'GRANTED_FOREGROUND' ||
            permStatus === 'GRANTED_BACKGROUND')
        ) {
          await startTracking();
          setState(prev => ({...prev, tracking: true}));
        }
      } catch (err) {
        console.error('[useRadarGeofencing] Init error:', err);
        setError('Failed to initialize geofencing');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [autoStart, userId]);

  // Update user ID when it changes
  useEffect(() => {
    if (userId && state.initialized) {
      setUserId(userId);

      // Check for active check-in
      getActiveCheckIn(userId).then(activeCheckIn => {
        setState(prev => ({...prev, activeCheckIn}));
      });
    }
  }, [userId, state.initialized]);

  // Handle geofence events
  useEffect(() => {
    if (!state.initialized || !userId) return;

    const unsubscribe = onGeofenceEvent(async (event: GeofenceEvent) => {
      console.log('[useRadarGeofencing] Geofence event:', event.type);

      setState(prev => ({...prev, lastEvent: event}));

      if (event.type === 'entry') {
        // Auto check-in
        const success = await checkInViaRadar(
          userId,
          event.courtId,
          event.radarEventId,
        );

        if (success) {
          setState(prev => ({
            ...prev,
            activeCheckIn: {
              courtId: event.courtId,
              enteredAt: event.timestamp.toISOString(),
            },
          }));

          if (showAlerts) {
            Alert.alert(
              'Checked In!',
              `You've arrived at ${event.courtName}. Have a great game!`,
              [{text: 'OK'}],
            );
          }
        }
      } else if (event.type === 'exit') {
        // Auto check-out
        const success = await checkOutViaRadar(
          userId,
          event.courtId,
          event.radarEventId,
        );

        if (success) {
          setState(prev => ({...prev, activeCheckIn: null}));

          if (showAlerts) {
            Alert.alert(
              'Checked Out',
              `Thanks for playing at ${event.courtName}!`,
              [{text: 'OK'}],
            );
          }
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [state.initialized, userId, showAlerts]);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (
          appStateRef.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          // App came to foreground - refresh state
          if (userId) {
            getActiveCheckIn(userId).then(activeCheckIn => {
              setState(prev => ({...prev, activeCheckIn}));
            });
          }
        }

        appStateRef.current = nextAppState;
      },
    );

    return () => {
      subscription.remove();
    };
  }, [userId]);

  // Request permissions
  const requestPermissions = useCallback(async () => {
    try {
      const granted = await requestLocationPermissions();
      const permStatus = await getPermissionStatus();

      setState(prev => ({...prev, permissionStatus: permStatus}));

      if (granted && autoStart) {
        await startTracking();
        setState(prev => ({...prev, tracking: true}));
      }

      return granted;
    } catch (err) {
      console.error('[useRadarGeofencing] Permission error:', err);
      return false;
    }
  }, [autoStart]);

  // Start/stop tracking
  const enableTracking = useCallback(async () => {
    if (
      state.permissionStatus !== 'GRANTED_FOREGROUND' &&
      state.permissionStatus !== 'GRANTED_BACKGROUND'
    ) {
      const granted = await requestPermissions();
      if (!granted) return false;
    }

    await startTracking();
    setState(prev => ({...prev, tracking: true}));
    return true;
  }, [state.permissionStatus, requestPermissions]);

  const disableTracking = useCallback(() => {
    stopTracking();
    setState(prev => ({...prev, tracking: false}));
  }, []);

  // Manual check-in (in addition to automatic)
  const manualCheckIn = useCallback(
    async (courtId: string): Promise<boolean> => {
      if (!userId) return false;

      try {
        const {error} = await require('../lib/supabase').supabase
          .from('court_presence')
          .insert({
            user_id: userId,
            court_id: courtId,
            entry_method: 'manual',
            entered_at: new Date().toISOString(),
          });

        if (error) throw error;

        setState(prev => ({
          ...prev,
          activeCheckIn: {
            courtId,
            enteredAt: new Date().toISOString(),
          },
        }));

        return true;
      } catch (err) {
        console.error('[useRadarGeofencing] Manual check-in error:', err);
        return false;
      }
    },
    [userId],
  );

  // Manual check-out
  const manualCheckOut = useCallback(async (): Promise<boolean> => {
    if (!userId || !state.activeCheckIn) return false;

    try {
      const {supabase} = require('../lib/supabase');

      // Find active presence
      const {data: presence} = await supabase
        .from('court_presence')
        .select('id')
        .eq('user_id', userId)
        .eq('court_id', state.activeCheckIn.courtId)
        .is('exited_at', null)
        .order('entered_at', {ascending: false})
        .limit(1)
        .single();

      if (!presence) return false;

      // Update with exit time
      const {error} = await supabase
        .from('court_presence')
        .update({exited_at: new Date().toISOString()})
        .eq('id', presence.id);

      if (error) throw error;

      setState(prev => ({...prev, activeCheckIn: null}));
      return true;
    } catch (err) {
      console.error('[useRadarGeofencing] Manual check-out error:', err);
      return false;
    }
  }, [userId, state.activeCheckIn]);

  // Force a location check
  const forceLocationCheck = useCallback(async () => {
    const location = await trackOnce();
    return location;
  }, []);

  return {
    ...state,
    loading,
    error,
    requestPermissions,
    enableTracking,
    disableTracking,
    manualCheckIn,
    manualCheckOut,
    forceLocationCheck,
  };
}
