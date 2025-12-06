import {useState, useCallback} from 'react';
import {supabase, Court} from '../lib/supabase';
import {getCurrentLocation, getDistanceMiles} from '../services/location';
import {searchNearbyCourts, DiscoveredCourt} from '../services/radarSearch';

const DEFAULT_RADIUS_MILES = 10;

export interface CourtWithDistance extends Court {
  distance: number | null;
}

/**
 * Hook to discover and fetch courts near the user
 * - First checks Supabase for cached courts within radius
 * - If no courts found, queries Radar Search API
 * - Saves discovered courts to Supabase for future users
 */
export function useCourtDiscovery(radiusMiles: number = DEFAULT_RADIUS_MILES) {
  const [courts, setCourts] = useState<CourtWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);

  const discoverCourts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Get user's current location
      const location = await getCurrentLocation();

      if (!location) {
        // No location - just fetch all courts from Supabase
        const {data, error: fetchError} = await supabase
          .from('courts')
          .select('*')
          .eq('status', 'approved')
          .order('name');

        if (fetchError) throw fetchError;

        setCourts(
          (data || []).map(court => ({
            ...court,
            distance: null,
          })),
        );
        return;
      }

      const userLat = location.coords.latitude;
      const userLng = location.coords.longitude;

      // Step 2: Check Supabase for nearby courts
      // Using a simple bounding box query (approximate)
      const latDelta = radiusMiles / 69; // ~69 miles per degree latitude
      const lngDelta = radiusMiles / (69 * Math.cos(userLat * (Math.PI / 180)));

      const {data: existingCourts, error: fetchError} = await supabase
        .from('courts')
        .select('*')
        .eq('status', 'approved')
        .gte('lat', userLat - latDelta)
        .lte('lat', userLat + latDelta)
        .gte('lng', userLng - lngDelta)
        .lte('lng', userLng + lngDelta);

      if (fetchError) throw fetchError;

      // Filter by actual distance and add distance field
      let courtsWithDistance: CourtWithDistance[] = (existingCourts || [])
        .map(court => ({
          ...court,
          distance: getDistanceMiles(userLat, userLng, court.lat, court.lng),
        }))
        .filter(court => court.distance !== null && court.distance <= radiusMiles);

      // Step 3: If no courts found, search via Radar API
      if (courtsWithDistance.length === 0) {
        setIsDiscovering(true);

        try {
          const discoveredCourts = await searchNearbyCourts(
            userLat,
            userLng,
            radiusMiles,
          );

          if (discoveredCourts.length > 0) {
            // Step 4: Save discovered courts to Supabase
            const newCourts = await saveDiscoveredCourts(discoveredCourts);

            courtsWithDistance = newCourts.map(court => ({
              ...court,
              distance: getDistanceMiles(userLat, userLng, court.lat, court.lng),
            }));
          }
        } catch (discoveryError) {
          console.error('Court discovery error:', discoveryError);
          // Don't fail entirely - just log and continue with empty results
        } finally {
          setIsDiscovering(false);
        }
      }

      // Sort by distance
      courtsWithDistance.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });

      setCourts(courtsWithDistance);
    } catch (err: any) {
      console.error('Error discovering courts:', err);
      setError(err.message || 'Failed to discover courts');
    } finally {
      setLoading(false);
    }
  }, [radiusMiles]);

  return {
    courts,
    loading,
    error,
    isDiscovering,
    refetch: discoverCourts,
  };
}

/**
 * Save discovered courts to Supabase
 * Returns the newly inserted courts
 */
async function saveDiscoveredCourts(
  discoveredCourts: DiscoveredCourt[],
): Promise<Court[]> {
  const courtsToInsert = discoveredCourts.map(court => ({
    place_id: court.place_id,
    name: court.name,
    address: court.address,
    lat: court.lat,
    lng: court.lng,
    source: court.source,
    categories: court.categories,
    status: 'approved' as const, // Discovered courts are auto-approved
    rating: null,
    photo_url: null,
  }));

  // Use upsert to avoid duplicates (on place_id conflict)
  const {data, error} = await supabase
    .from('courts')
    .upsert(courtsToInsert, {
      onConflict: 'place_id',
      ignoreDuplicates: true,
    })
    .select();

  if (error) {
    console.error('Error saving courts:', error);
    throw error;
  }

  return data || [];
}

/**
 * Submit a user-discovered court (requires admin approval)
 */
export async function submitCourt(
  name: string,
  address: string,
  lat: number,
  lng: number,
): Promise<{success: boolean; error?: string}> {
  try {
    const {
      data: {user},
    } = await supabase.auth.getUser();

    if (!user) {
      return {success: false, error: 'Not authenticated'};
    }

    const {error} = await supabase.from('courts').insert({
      place_id: `user_${user.id}_${Date.now()}`,
      name,
      address,
      lat,
      lng,
      status: 'pending',
      source: 'user_submitted',
      submitted_by: user.id,
      submitted_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error submitting court:', error);
      return {success: false, error: error.message};
    }

    return {success: true};
  } catch (err: any) {
    console.error('Error submitting court:', err);
    return {success: false, error: err.message || 'Failed to submit court'};
  }
}
