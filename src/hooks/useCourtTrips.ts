import {useEffect, useState, useCallback} from 'react';
import {supabase} from '../lib/supabase';
import {RealtimeChannel} from '@supabase/supabase-js';
import {
  TripWithDetails,
  startTrip as startTripService,
  cancelTrip as cancelTripService,
  getActiveTrip,
  getActiveTripsForCourt,
  formatETA,
} from '../services/tripService';
import {getCurrentLocation} from '../services/location';

// Re-export types and helpers
export type {TripWithDetails};
export {formatETA};

// =============================================================================
// USER'S ACTIVE TRIP HOOK
// =============================================================================

/**
 * Hook to manage the current user's active trip
 */
export function useMyTrip(userId: string | null) {
  const [trip, setTrip] = useState<TripWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Fetch user's active trip
  const fetchTrip = useCallback(async () => {
    if (!userId) {
      setTrip(null);
      setLoading(false);
      return;
    }

    try {
      const activeTrip = await getActiveTrip(userId);
      setTrip(activeTrip);
    } catch (error) {
      console.error('Error fetching user trip:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Start a new trip
  const startTrip = useCallback(
    async (
      courtId: string,
      courtLat: number,
      courtLng: number,
    ): Promise<{success: boolean; error?: string}> => {
      if (!userId) {
        return {success: false, error: 'Not logged in'};
      }

      setStarting(true);
      try {
        // Get current location
        const location = await getCurrentLocation();
        if (location.isDefault) {
          return {success: false, error: 'Could not get your location'};
        }

        const result = await startTripService(
          userId,
          courtId,
          location.coords.latitude,
          location.coords.longitude,
          courtLat,
          courtLng,
        );

        if (result.success) {
          await fetchTrip();
        }

        return result;
      } finally {
        setStarting(false);
      }
    },
    [userId, fetchTrip],
  );

  // Cancel active trip
  const cancelTrip = useCallback(async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    if (!trip) {
      return {success: false, error: 'No active trip'};
    }

    setCancelling(true);
    try {
      const result = await cancelTripService(trip.id);
      if (result.success) {
        setTrip(null);
      }
      return result;
    } finally {
      setCancelling(false);
    }
  }, [trip]);

  // Subscribe to realtime updates
  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    const subscribe = async () => {
      await fetchTrip();

      if (!userId) return;

      // Subscribe to changes for this user's trips
      channel = supabase
        .channel(`user-trips-${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'court_trips',
            filter: `user_id=eq.${userId}`,
          },
          async () => {
            await fetchTrip();
          },
        )
        .subscribe();
    };

    subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId, fetchTrip]);

  return {
    trip,
    loading,
    starting,
    cancelling,
    startTrip,
    cancelTrip,
    refetch: fetchTrip,
    hasActiveTrip: !!trip,
  };
}

// =============================================================================
// COURT'S INCOMING TRIPS HOOK
// =============================================================================

/**
 * Hook to get all users heading to a specific court
 */
export function useCourtTrips(courtId: string | null) {
  const [trips, setTrips] = useState<TripWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch trips for this court
  const fetchTrips = useCallback(async () => {
    if (!courtId) {
      setTrips([]);
      setLoading(false);
      return;
    }

    try {
      const activeTrips = await getActiveTripsForCourt(courtId);
      setTrips(activeTrips);
    } catch (error) {
      console.error('Error fetching court trips:', error);
    } finally {
      setLoading(false);
    }
  }, [courtId]);

  // Subscribe to realtime updates
  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    const subscribe = async () => {
      await fetchTrips();

      if (!courtId) return;

      // Subscribe to changes for trips to this court
      channel = supabase
        .channel(`court-trips-${courtId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'court_trips',
            filter: `court_id=eq.${courtId}`,
          },
          async () => {
            await fetchTrips();
          },
        )
        .subscribe();
    };

    subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [courtId, fetchTrips]);

  return {
    trips,
    loading,
    count: trips.length,
    refetch: fetchTrips,
  };
}

// =============================================================================
// COMBINED HOOK FOR COURT DETAILS
// =============================================================================

/**
 * Combined hook for court details screen - gets both incoming trips and user's trip
 */
export function useCourtTripsWithUser(courtId: string | null, userId: string | null) {
  const {trips, loading: tripsLoading, count, refetch: refetchTrips} = useCourtTrips(courtId);
  const {
    trip: myTrip,
    loading: myTripLoading,
    starting,
    cancelling,
    startTrip,
    cancelTrip,
    refetch: refetchMyTrip,
  } = useMyTrip(userId);

  // Check if user's trip is to this specific court
  const isHeadingHere = myTrip?.court_id === courtId;

  const refetch = useCallback(async () => {
    await Promise.all([refetchTrips(), refetchMyTrip()]);
  }, [refetchTrips, refetchMyTrip]);

  return {
    // All trips to this court
    trips,
    tripsCount: count,
    tripsLoading,

    // User's active trip (may be to different court)
    myTrip,
    myTripLoading,

    // Whether user is heading to THIS court
    isHeadingHere,

    // Actions
    starting,
    cancelling,
    startTrip,
    cancelTrip,
    refetch,
  };
}
