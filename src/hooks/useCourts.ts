import {useEffect, useState, useCallback} from 'react';
import {supabase, Court} from '../lib/supabase';
import {getCurrentLocation, getDistanceMiles} from '../services/location';
import {searchNearbyCourts, DiscoveredCourt} from '../services/mapboxSearch';

const DEFAULT_RADIUS_MILES = 10;

export interface CourtWithDistance extends Court {
  distance: number | null;
}

/**
 * Hook to fetch and manage courts with automatic discovery
 * - Checks Supabase for nearby courts
 * - If none found, discovers via Mapbox Search API
 * - Caches discovered courts in Supabase
 */
export function useCourts(radiusMiles: number = DEFAULT_RADIUS_MILES) {
  const [courts, setCourts] = useState<CourtWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);

  const fetchCourts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get current location
      const location = await getCurrentLocation();

      if (!location) {
        // No location - just fetch all approved courts
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

      // Calculate bounding box for nearby courts
      const latDelta = radiusMiles / 69;
      const lngDelta = radiusMiles / (69 * Math.cos(userLat * (Math.PI / 180)));

      // Fetch courts within bounding box
      const {data, error: fetchError} = await supabase
        .from('courts')
        .select('*')
        .eq('status', 'approved')
        .gte('lat', userLat - latDelta)
        .lte('lat', userLat + latDelta)
        .gte('lng', userLng - lngDelta)
        .lte('lng', userLng + lngDelta);

      if (fetchError) throw fetchError;

      // Calculate distances and filter by actual radius
      let courtsWithDistance: CourtWithDistance[] = (data || [])
        .map(court => ({
          ...court,
          distance: getDistanceMiles(userLat, userLng, court.lat, court.lng),
        }))
        .filter(court => court.distance !== null && court.distance <= radiusMiles);

      // If no courts found, discover via Mapbox
      if (courtsWithDistance.length === 0) {
        setIsDiscovering(true);

        try {
          const discoveredCourts = await searchNearbyCourts(
            userLat,
            userLng,
            radiusMiles,
          );

          if (discoveredCourts.length > 0) {
            const newCourts = await saveDiscoveredCourts(discoveredCourts);
            courtsWithDistance = newCourts.map(court => ({
              ...court,
              distance: getDistanceMiles(userLat, userLng, court.lat, court.lng),
            }));
          }
        } catch (discoveryError) {
          console.error('Court discovery error:', discoveryError);
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
      console.error('Error fetching courts:', err);
      setError(err.message || 'Failed to fetch courts');
    } finally {
      setLoading(false);
    }
  }, [radiusMiles]);

  useEffect(() => {
    fetchCourts();
  }, [fetchCourts]);

  return {courts, loading, error, isDiscovering, refetch: fetchCourts};
}

/**
 * Save discovered courts to Supabase
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
    status: 'approved' as const,
    rating: null,
    photo_url: null,
  }));

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
 * Hook to manage favorite courts
 */
export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    try {
      const {
        data: {user},
      } = await supabase.auth.getUser();
      if (!user) return;

      const {data, error} = await supabase
        .from('favorites')
        .select('court_id')
        .eq('user_id', user.id);

      if (error) throw error;

      setFavoriteIds(new Set(data?.map(f => f.court_id) || []));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = useCallback(
    async (courtId: string) => {
      const {
        data: {user},
      } = await supabase.auth.getUser();
      if (!user) return;

      const isFavorite = favoriteIds.has(courtId);

      try {
        if (isFavorite) {
          await supabase
            .from('favorites')
            .delete()
            .eq('user_id', user.id)
            .eq('court_id', courtId);

          setFavoriteIds(prev => {
            const next = new Set(prev);
            next.delete(courtId);
            return next;
          });
        } else {
          await supabase.from('favorites').insert({
            user_id: user.id,
            court_id: courtId,
          });

          setFavoriteIds(prev => new Set(prev).add(courtId));
        }
      } catch (error) {
        console.error('Error toggling favorite:', error);
        // Revert on error
        await fetchFavorites();
      }
    },
    [favoriteIds, fetchFavorites],
  );

  const isFavorite = useCallback(
    (courtId: string) => favoriteIds.has(courtId),
    [favoriteIds],
  );

  return {favoriteIds, loading, toggleFavorite, isFavorite, refetch: fetchFavorites};
}

/**
 * Hook to manage follows
 */
export function useFollows() {
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchFollowing = useCallback(async () => {
    try {
      const {
        data: {user},
      } = await supabase.auth.getUser();
      if (!user) return;

      const {data, error} = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      if (error) throw error;

      setFollowingIds(new Set(data?.map(f => f.following_id) || []));
    } catch (error) {
      console.error('Error fetching follows:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFollowing();
  }, [fetchFollowing]);

  const toggleFollow = useCallback(
    async (userId: string) => {
      const {
        data: {user},
      } = await supabase.auth.getUser();
      if (!user || user.id === userId) return;

      const isFollowing = followingIds.has(userId);

      try {
        if (isFollowing) {
          await supabase
            .from('follows')
            .delete()
            .eq('follower_id', user.id)
            .eq('following_id', userId);

          setFollowingIds(prev => {
            const next = new Set(prev);
            next.delete(userId);
            return next;
          });
        } else {
          await supabase.from('follows').insert({
            follower_id: user.id,
            following_id: userId,
          });

          setFollowingIds(prev => new Set(prev).add(userId));
        }
      } catch (error) {
        console.error('Error toggling follow:', error);
        await fetchFollowing();
      }
    },
    [followingIds, fetchFollowing],
  );

  const isFollowing = useCallback(
    (userId: string) => followingIds.has(userId),
    [followingIds],
  );

  return {followingIds, loading, toggleFollow, isFollowing, refetch: fetchFollowing};
}
