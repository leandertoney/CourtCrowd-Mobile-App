import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import {supabase} from '../lib/supabase';

const LOCATION_TASK_NAME = 'court-crowd-background-location';
const GEOFENCE_RADIUS_METERS = 15; // ~50 feet

// Haversine distance calculation
function getDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Define the background task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({data, error}) => {
  if (error) {
    console.error('Background location error:', error);
    return;
  }

  const {locations} = data as {locations: Location.LocationObject[]};
  const location = locations[0];

  if (!location) return;

  try {
    // Get current user
    const {
      data: {user},
    } = await supabase.auth.getUser();
    if (!user) return;

    // Check if user has location sharing enabled
    const {data: userData} = await supabase
      .from('users')
      .select('location_sharing')
      .eq('id', user.id)
      .single();

    if (!userData?.location_sharing) return;

    // Fetch all courts
    const {data: courts} = await supabase
      .from('courts')
      .select('id, lat, lng, name');

    if (!courts) return;

    // Check proximity to each court
    for (const court of courts) {
      const distance = getDistanceMeters(
        location.coords.latitude,
        location.coords.longitude,
        court.lat,
        court.lng,
      );

      if (distance <= GEOFENCE_RADIUS_METERS) {
        // User is at this court - upsert presence
        await supabase.from('court_presence').upsert(
          {
            user_id: user.id,
            court_id: court.id,
            entered_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,court_id',
          },
        );
      } else {
        // User is not at this court - remove presence if exists
        await supabase
          .from('court_presence')
          .delete()
          .eq('user_id', user.id)
          .eq('court_id', court.id);
      }
    }
  } catch (err) {
    console.error('Error processing location update:', err);
  }
});

/**
 * Request location permissions
 */
export async function requestLocationPermissions(): Promise<{
  foreground: boolean;
  background: boolean;
}> {
  const {status: foregroundStatus} =
    await Location.requestForegroundPermissionsAsync();

  if (foregroundStatus !== 'granted') {
    return {foreground: false, background: false};
  }

  const {status: backgroundStatus} =
    await Location.requestBackgroundPermissionsAsync();

  return {
    foreground: true,
    background: backgroundStatus === 'granted',
  };
}

/**
 * Start background location tracking
 */
export async function startLocationTracking(): Promise<boolean> {
  try {
    const permissions = await requestLocationPermissions();

    if (!permissions.foreground) {
      console.log('Foreground location permission not granted');
      return false;
    }

    if (!permissions.background) {
      console.log('Background location permission not granted');
      // Still start foreground tracking
    }

    // Check if already running
    const isRunning = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TASK_NAME,
    );
    if (isRunning) {
      console.log('Location tracking already running');
      return true;
    }

    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      distanceInterval: 10, // Update every 10 meters
      deferredUpdatesInterval: 60000, // Batch updates every minute
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'Court Crowd',
        notificationBody: 'Tracking your court presence',
        notificationColor: '#CAFF00',
      },
    });

    console.log('Location tracking started');
    return true;
  } catch (error) {
    console.error('Failed to start location tracking:', error);
    return false;
  }
}

/**
 * Stop background location tracking
 */
export async function stopLocationTracking(): Promise<void> {
  try {
    const isRunning = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TASK_NAME,
    );

    if (isRunning) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      console.log('Location tracking stopped');
    }

    // Also clear any existing presence
    const {
      data: {user},
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('court_presence').delete().eq('user_id', user.id);
    }
  } catch (error) {
    console.error('Failed to stop location tracking:', error);
  }
}

/**
 * Get current location (one-time)
 */
export async function getCurrentLocation(): Promise<Location.LocationObject | null> {
  try {
    const {status} = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return location;
  } catch (error) {
    console.error('Failed to get current location:', error);
    return null;
  }
}

/**
 * Check if location tracking is running
 */
export async function isLocationTrackingRunning(): Promise<boolean> {
  try {
    return await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  } catch {
    return false;
  }
}

/**
 * Toggle location sharing preference
 */
export async function setLocationSharing(
  userId: string,
  enabled: boolean,
): Promise<void> {
  await supabase
    .from('users')
    .update({location_sharing: enabled})
    .eq('id', userId);

  if (enabled) {
    await startLocationTracking();
  } else {
    await stopLocationTracking();
  }
}

/**
 * Calculate distance between user and a court (in miles)
 */
export function getDistanceMiles(
  userLat: number,
  userLng: number,
  courtLat: number,
  courtLng: number,
): number {
  const meters = getDistanceMeters(userLat, userLng, courtLat, courtLng);
  return meters / 1609.344; // Convert to miles
}
