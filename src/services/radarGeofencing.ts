/**
 * Radar SDK Geofencing Service
 * Handles automatic check-in/check-out when users arrive at or leave courts
 * Docs: https://radar.com/documentation/sdk
 *
 * NOTE: This requires a development build - won't work in Expo Go
 */

import {Platform} from 'react-native';
import {supabase} from '../lib/supabase';

const RADAR_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_RADAR_API_KEY || '';

// Lazy load Radar to prevent crashes in Expo Go
let Radar: any = null;
let radarAvailable = false;

try {
  Radar = require('react-native-radar').default;
  radarAvailable = true;
} catch (error) {
  console.warn('[Radar] Native module not available (requires development build)');
  radarAvailable = false;
}

/**
 * Check if Radar SDK is available (requires dev build, not Expo Go)
 */
export function isRadarAvailable(): boolean {
  return radarAvailable;
}

// Geofence radius in meters (100m is good for courts)
export const GEOFENCE_RADIUS_METERS = 100;

// Event types for geofencing
export type GeofenceEventType = 'entry' | 'exit' | 'dwell';

export interface GeofenceEvent {
  type: GeofenceEventType;
  courtId: string;
  courtName: string;
  radarEventId: string;
  timestamp: Date;
}

// Callback type for geofence events
export type GeofenceEventCallback = (event: GeofenceEvent) => void;

// Store callbacks for geofence events
let geofenceCallbacks: GeofenceEventCallback[] = [];

/**
 * Initialize Radar SDK
 * Should be called once on app start
 */
export async function initializeRadar(): Promise<boolean> {
  try {
    if (!radarAvailable) {
      console.warn('[Radar] SDK not available (requires development build)');
      return false;
    }

    if (!RADAR_PUBLISHABLE_KEY) {
      console.error('[Radar] No publishable key found');
      return false;
    }

    // Initialize with publishable key
    Radar.initialize(RADAR_PUBLISHABLE_KEY);

    // Set log level for debugging (remove in production)
    Radar.setLogLevel('info');

    // Set up event listeners
    setupEventListeners();

    console.log('[Radar] SDK initialized successfully');
    return true;
  } catch (error) {
    console.error('[Radar] Initialization failed:', error);
    return false;
  }
}

/**
 * Request location permissions
 * Returns true if permissions granted
 */
export async function requestLocationPermissions(): Promise<boolean> {
  if (!radarAvailable) return false;

  try {
    const status = await Radar.requestPermissions(true); // true = background

    if (status === 'GRANTED_FOREGROUND' || status === 'GRANTED_BACKGROUND') {
      console.log('[Radar] Location permissions granted:', status);
      return true;
    }

    console.log('[Radar] Location permissions denied:', status);
    return false;
  } catch (error) {
    console.error('[Radar] Error requesting permissions:', error);
    return false;
  }
}

/**
 * Get current permission status
 */
export async function getPermissionStatus(): Promise<string> {
  if (!radarAvailable) return 'UNAVAILABLE';

  try {
    const status = await Radar.getPermissionsStatus();
    return status;
  } catch (error) {
    console.error('[Radar] Error getting permission status:', error);
    return 'UNKNOWN';
  }
}

/**
 * Set user ID for Radar (should match Supabase user ID)
 */
export function setUserId(userId: string): void {
  if (!radarAvailable) return;
  Radar.setUserId(userId);
  console.log('[Radar] User ID set:', userId);
}

/**
 * Set user metadata
 */
export function setUserMetadata(metadata: Record<string, string>): void {
  if (!radarAvailable) return;
  Radar.setMetadata(metadata);
}

/**
 * Start tracking user location for geofencing
 * Uses "responsive" preset for balanced battery/accuracy
 */
export async function startTracking(): Promise<void> {
  if (!radarAvailable) return;

  try {
    // Use responsive tracking - good balance for geofencing
    Radar.startTrackingResponsive();
    console.log('[Radar] Started location tracking (responsive mode)');
  } catch (error) {
    console.error('[Radar] Error starting tracking:', error);
  }
}

/**
 * Stop tracking user location
 */
export function stopTracking(): void {
  if (!radarAvailable) return;
  Radar.stopTracking();
  console.log('[Radar] Stopped location tracking');
}

/**
 * Get current tracking status
 */
export async function isTracking(): Promise<boolean> {
  if (!radarAvailable) return false;

  try {
    const status = await Radar.getTrackingOptions();
    return !!status;
  } catch (error) {
    return false;
  }
}

/**
 * Manually trigger a location update
 * Useful for testing or forcing a check
 */
export async function trackOnce(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  if (!radarAvailable) return null;

  try {
    const result = await Radar.trackOnce();

    if (result.location) {
      return {
        latitude: result.location.latitude,
        longitude: result.location.longitude,
      };
    }

    return null;
  } catch (error) {
    console.error('[Radar] Track once failed:', error);
    return null;
  }
}

/**
 * Create a geofence for a court
 * This creates a geofence in Radar that will trigger events when entered/exited
 */
export async function createCourtGeofence(
  courtId: string,
  courtName: string,
  latitude: number,
  longitude: number,
  radiusMeters: number = GEOFENCE_RADIUS_METERS,
): Promise<boolean> {
  try {
    // Radar geofences are created server-side via API
    // For client SDK, we use "trip" tracking to a destination
    // The SDK will automatically detect arrival

    console.log(
      `[Radar] Geofence would be created for ${courtName} at ${latitude},${longitude}`,
    );

    // Note: In production, you'd create geofences via Radar Dashboard or API
    // For now, we'll rely on trip-based arrival detection

    return true;
  } catch (error) {
    console.error('[Radar] Error creating geofence:', error);
    return false;
  }
}

/**
 * Start a trip to a court (enables arrival detection)
 */
export async function startTripToCourt(
  courtId: string,
  courtName: string,
  destinationLat: number,
  destinationLng: number,
): Promise<boolean> {
  if (!radarAvailable) return false;

  try {
    // Start trip tracking to destination
    const options = {
      tripOptions: {
        externalId: courtId,
        destinationGeofenceTag: 'court',
        destinationGeofenceExternalId: courtId,
        mode: 'car' as const,
        metadata: {
          courtName,
          courtId,
        },
      },
    };

    await Radar.startTrip(options);
    console.log(`[Radar] Started trip to ${courtName}`);
    return true;
  } catch (error) {
    console.error('[Radar] Error starting trip:', error);
    return false;
  }
}

/**
 * Complete/cancel current trip
 */
export async function completeTrip(): Promise<void> {
  if (!radarAvailable) return;

  try {
    await Radar.completeTrip();
    console.log('[Radar] Trip completed');
  } catch (error) {
    console.error('[Radar] Error completing trip:', error);
  }
}

/**
 * Cancel current trip
 */
export async function cancelTrip(): Promise<void> {
  if (!radarAvailable) return;

  try {
    await Radar.cancelTrip();
    console.log('[Radar] Trip cancelled');
  } catch (error) {
    console.error('[Radar] Error cancelling trip:', error);
  }
}

/**
 * Register a callback for geofence events
 */
export function onGeofenceEvent(callback: GeofenceEventCallback): () => void {
  geofenceCallbacks.push(callback);

  // Return unsubscribe function
  return () => {
    geofenceCallbacks = geofenceCallbacks.filter(cb => cb !== callback);
  };
}

/**
 * Set up Radar event listeners
 */
function setupEventListeners(): void {
  // Listen for location updates
  Radar.onLocationUpdated((result: any) => {
    console.log('[Radar] Location update:', result.location);
  });

  // Listen for geofence/trip events
  Radar.onEventsReceived((result: any) => {
    console.log('[Radar] Events received:', result.events?.length || 0);

    if (result.events) {
      for (const event of result.events) {
        handleRadarEvent(event);
      }
    }
  });

  // Listen for errors
  Radar.onError((err: any) => {
    console.error('[Radar] Error:', err);
  });

  // Listen for client location updates (more frequent)
  Radar.onClientLocationUpdated((result: any) => {
    // Can use this for real-time location display if needed
  });
}

/**
 * Handle a Radar event and convert to our format
 */
function handleRadarEvent(radarEvent: any): void {
  // Check if this is a geofence event
  if (radarEvent.type?.startsWith('user.entered_geofence')) {
    const geofence = radarEvent.geofence;
    if (geofence) {
      notifyGeofenceEvent({
        type: 'entry',
        courtId: geofence.externalId || geofence._id,
        courtName: geofence.description || geofence.tag || 'Unknown Court',
        radarEventId: radarEvent._id,
        timestamp: new Date(radarEvent.createdAt),
      });
    }
  } else if (radarEvent.type?.startsWith('user.exited_geofence')) {
    const geofence = radarEvent.geofence;
    if (geofence) {
      notifyGeofenceEvent({
        type: 'exit',
        courtId: geofence.externalId || geofence._id,
        courtName: geofence.description || geofence.tag || 'Unknown Court',
        radarEventId: radarEvent._id,
        timestamp: new Date(radarEvent.createdAt),
      });
    }
  } else if (radarEvent.type?.startsWith('user.dwelled_in_geofence')) {
    const geofence = radarEvent.geofence;
    if (geofence) {
      notifyGeofenceEvent({
        type: 'dwell',
        courtId: geofence.externalId || geofence._id,
        courtName: geofence.description || geofence.tag || 'Unknown Court',
        radarEventId: radarEvent._id,
        timestamp: new Date(radarEvent.createdAt),
      });
    }
  }

  // Handle trip arrival (alternative to geofences)
  if (radarEvent.type === 'user.arrived_at_trip_destination') {
    const trip = radarEvent.trip;
    if (trip?.metadata?.courtId) {
      notifyGeofenceEvent({
        type: 'entry',
        courtId: trip.metadata.courtId,
        courtName: trip.metadata.courtName || 'Unknown Court',
        radarEventId: radarEvent._id,
        timestamp: new Date(radarEvent.createdAt),
      });
    }
  }
}

/**
 * Notify all registered callbacks of a geofence event
 */
function notifyGeofenceEvent(event: GeofenceEvent): void {
  console.log(`[Radar] Geofence ${event.type} at ${event.courtName}`);

  for (const callback of geofenceCallbacks) {
    try {
      callback(event);
    } catch (error) {
      console.error('[Radar] Error in geofence callback:', error);
    }
  }
}

/**
 * Check in to a court via Radar event
 * This is called when we detect geofence entry
 */
export async function checkInViaRadar(
  userId: string,
  courtId: string,
  radarEventId: string,
): Promise<boolean> {
  try {
    const {error} = await supabase.from('court_presence').insert({
      user_id: userId,
      court_id: courtId,
      entry_method: 'radar',
      radar_event_id: radarEventId,
      entered_at: new Date().toISOString(),
    });

    if (error) {
      console.error('[Radar] Check-in error:', error);
      return false;
    }

    console.log(`[Radar] User ${userId} checked in to court ${courtId}`);
    return true;
  } catch (error) {
    console.error('[Radar] Check-in failed:', error);
    return false;
  }
}

/**
 * Check out from a court via Radar event
 * This is called when we detect geofence exit
 */
export async function checkOutViaRadar(
  userId: string,
  courtId: string,
  radarEventId: string,
): Promise<boolean> {
  try {
    // Find the active presence record
    const {data: presence, error: fetchError} = await supabase
      .from('court_presence')
      .select('id')
      .eq('user_id', userId)
      .eq('court_id', courtId)
      .is('exited_at', null)
      .order('entered_at', {ascending: false})
      .limit(1)
      .single();

    if (fetchError || !presence) {
      console.log('[Radar] No active presence found to check out');
      return false;
    }

    // Update with exit time (trigger will calculate duration)
    const {error: updateError} = await supabase
      .from('court_presence')
      .update({
        exited_at: new Date().toISOString(),
      })
      .eq('id', presence.id);

    if (updateError) {
      console.error('[Radar] Check-out error:', updateError);
      return false;
    }

    console.log(`[Radar] User ${userId} checked out from court ${courtId}`);
    return true;
  } catch (error) {
    console.error('[Radar] Check-out failed:', error);
    return false;
  }
}

/**
 * Get user's current active check-in (if any)
 */
export async function getActiveCheckIn(
  userId: string,
): Promise<{courtId: string; enteredAt: string} | null> {
  try {
    const {data, error} = await supabase
      .from('court_presence')
      .select('court_id, entered_at')
      .eq('user_id', userId)
      .is('exited_at', null)
      .order('entered_at', {ascending: false})
      .limit(1)
      .single();

    if (error || !data) return null;

    return {
      courtId: data.court_id,
      enteredAt: data.entered_at,
    };
  } catch (error) {
    return null;
  }
}
