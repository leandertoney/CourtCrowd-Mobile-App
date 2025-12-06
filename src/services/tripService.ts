import {supabase} from '../lib/supabase';

// =============================================================================
// TYPES
// =============================================================================

export interface CourtTrip {
  id: string;
  user_id: string;
  court_id: string;
  status: 'active' | 'completed' | 'cancelled';
  start_latitude: number;
  start_longitude: number;
  current_latitude: number | null;
  current_longitude: number | null;
  estimated_arrival: string | null;
  distance_remaining_meters: number | null;
  started_at: string;
  completed_at: string | null;
  last_updated_at: string;
}

export interface TripWithDetails extends CourtTrip {
  user: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  } | null;
  court: {
    id: string;
    name: string;
    lat: number;
    lng: number;
  } | null;
}

// Average walking speed in meters per second (~3.5 mph)
const AVERAGE_WALKING_SPEED_MPS = 1.4;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function getDistanceMeters(
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

/**
 * Estimate arrival time based on distance and walking speed
 */
function estimateArrivalTime(distanceMeters: number): Date {
  const travelTimeSeconds = distanceMeters / AVERAGE_WALKING_SPEED_MPS;
  return new Date(Date.now() + travelTimeSeconds * 1000);
}

/**
 * Format ETA for display
 */
export function formatETA(estimatedArrival: string | null): string {
  if (!estimatedArrival) return 'Calculating...';

  const arrival = new Date(estimatedArrival);
  const now = new Date();
  const diffMs = arrival.getTime() - now.getTime();

  if (diffMs <= 0) return 'Arriving now';

  const diffMins = Math.round(diffMs / 60000);

  if (diffMins < 1) return 'Less than 1 min';
  if (diffMins === 1) return '1 min';
  if (diffMins < 60) return `${diffMins} mins`;

  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

// =============================================================================
// TRIP MANAGEMENT
// =============================================================================

/**
 * Start a new trip to a court
 */
export async function startTrip(
  userId: string,
  courtId: string,
  startLatitude: number,
  startLongitude: number,
  courtLatitude: number,
  courtLongitude: number,
): Promise<{success: boolean; trip?: CourtTrip; error?: string}> {
  try {
    // First, cancel any existing active trip
    await supabase
      .from('court_trips')
      .update({
        status: 'cancelled',
        completed_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('status', 'active');

    // Calculate initial ETA
    const distance = getDistanceMeters(
      startLatitude,
      startLongitude,
      courtLatitude,
      courtLongitude,
    );
    const eta = estimateArrivalTime(distance);

    // Create new trip
    const {data, error} = await supabase
      .from('court_trips')
      .insert({
        user_id: userId,
        court_id: courtId,
        status: 'active',
        start_latitude: startLatitude,
        start_longitude: startLongitude,
        current_latitude: startLatitude,
        current_longitude: startLongitude,
        estimated_arrival: eta.toISOString(),
        distance_remaining_meters: distance,
      })
      .select()
      .single();

    if (error) throw error;

    return {success: true, trip: data};
  } catch (error) {
    console.error('Error starting trip:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start trip',
    };
  }
}

/**
 * Update trip position and recalculate ETA
 */
export async function updateTripPosition(
  tripId: string,
  currentLatitude: number,
  currentLongitude: number,
  courtLatitude: number,
  courtLongitude: number,
): Promise<{success: boolean; error?: string}> {
  try {
    const distance = getDistanceMeters(
      currentLatitude,
      currentLongitude,
      courtLatitude,
      courtLongitude,
    );
    const eta = estimateArrivalTime(distance);

    const {error} = await supabase
      .from('court_trips')
      .update({
        current_latitude: currentLatitude,
        current_longitude: currentLongitude,
        estimated_arrival: eta.toISOString(),
        distance_remaining_meters: distance,
        last_updated_at: new Date().toISOString(),
      })
      .eq('id', tripId);

    if (error) throw error;

    return {success: true};
  } catch (error) {
    console.error('Error updating trip position:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update trip',
    };
  }
}

/**
 * Complete a trip (user arrived at destination)
 */
export async function completeTrip(
  tripId: string,
): Promise<{success: boolean; error?: string}> {
  try {
    const {error} = await supabase
      .from('court_trips')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        distance_remaining_meters: 0,
      })
      .eq('id', tripId);

    if (error) throw error;

    return {success: true};
  } catch (error) {
    console.error('Error completing trip:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to complete trip',
    };
  }
}

/**
 * Cancel an active trip
 */
export async function cancelTrip(
  tripId: string,
): Promise<{success: boolean; error?: string}> {
  try {
    const {error} = await supabase
      .from('court_trips')
      .update({
        status: 'cancelled',
        completed_at: new Date().toISOString(),
      })
      .eq('id', tripId);

    if (error) throw error;

    return {success: true};
  } catch (error) {
    console.error('Error cancelling trip:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel trip',
    };
  }
}

/**
 * Get user's active trip (if any)
 */
export async function getActiveTrip(
  userId: string,
): Promise<TripWithDetails | null> {
  try {
    const {data, error} = await supabase
      .from('court_trips')
      .select(
        `
        *,
        user:users (
          id,
          name,
          avatar_url
        ),
        court:courts (
          id,
          name,
          lat,
          lng
        )
      `,
      )
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return null;
      }
      throw error;
    }

    return data as TripWithDetails;
  } catch (error) {
    console.error('Error fetching active trip:', error);
    return null;
  }
}

/**
 * Get all active trips heading to a specific court
 */
export async function getActiveTripsForCourt(
  courtId: string,
): Promise<TripWithDetails[]> {
  try {
    const {data, error} = await supabase
      .from('court_trips')
      .select(
        `
        *,
        user:users (
          id,
          name,
          avatar_url
        ),
        court:courts (
          id,
          name,
          lat,
          lng
        )
      `,
      )
      .eq('court_id', courtId)
      .eq('status', 'active')
      .order('estimated_arrival', {ascending: true});

    if (error) throw error;

    return (data as TripWithDetails[]) || [];
  } catch (error) {
    console.error('Error fetching trips for court:', error);
    return [];
  }
}

/**
 * Update all active trips for a user based on their current position
 * Called from background location task
 */
export async function updateUserTrips(
  userId: string,
  currentLatitude: number,
  currentLongitude: number,
  courts: Array<{id: string; lat: number; lng: number}>,
  geofenceRadius: number,
): Promise<void> {
  try {
    // Get user's active trip
    const activeTrip = await getActiveTrip(userId);
    if (!activeTrip || !activeTrip.court) return;

    const court = courts.find(c => c.id === activeTrip.court_id);
    if (!court) return;

    // Calculate distance to destination
    const distance = getDistanceMeters(
      currentLatitude,
      currentLongitude,
      court.lat,
      court.lng,
    );

    // Check if user arrived (within geofence)
    if (distance <= geofenceRadius) {
      // Trip complete!
      await completeTrip(activeTrip.id);
    } else {
      // Update position and ETA
      await updateTripPosition(
        activeTrip.id,
        currentLatitude,
        currentLongitude,
        court.lat,
        court.lng,
      );
    }
  } catch (error) {
    console.error('Error updating user trips:', error);
  }
}
