/**
 * Hook for fetching court photos with Supabase caching
 * Photos are fetched from Google Places once, then cached in Supabase Storage
 */

import {useState, useEffect, useCallback} from 'react';
import {getCachedCourtPhoto} from '../services/courtPhotoCache';
import {isGooglePlaceId} from '../services/googlePlaces';

interface UseCourtPhotosOptions {
  autoFetch?: boolean;
  lat?: number;
  lng?: number;
  courtName?: string;
}

interface UseCourtPhotosResult {
  photoUrl: string | null;
  loading: boolean;
  error: string | null;
  fromCache: boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook to get a court photo with automatic caching
 * @param courtId - The court's database ID (UUID)
 * @param placeId - Google Place ID for fetching from Google Places
 * @param existingPhotoUrl - Current photo_url from the court record (if already cached)
 * @param options - Configuration options
 */
export function useCourtPhotos(
  courtId: string | null | undefined,
  placeId: string | null | undefined,
  existingPhotoUrl: string | null | undefined,
  options: UseCourtPhotosOptions = {}
): UseCourtPhotosResult {
  const {autoFetch = true, lat, lng, courtName} = options;

  const [photoUrl, setPhotoUrl] = useState<string | null>(existingPhotoUrl || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(Boolean(existingPhotoUrl));

  const fetchPhoto = useCallback(async () => {
    // If we already have a photo URL, use it
    if (existingPhotoUrl) {
      setPhotoUrl(existingPhotoUrl);
      setFromCache(true);
      setLoading(false);
      return;
    }

    // Need courtId to fetch/cache
    if (!courtId) {
      setPhotoUrl(null);
      setLoading(false);
      return;
    }

    // Add a random delay (0-3s) to stagger API requests when many cards load at once
    const randomDelay = Math.random() * 3000;
    await new Promise(resolve => setTimeout(resolve, randomDelay));

    // Need either a valid Google Place ID OR coordinates to look one up
    const hasGooglePlaceId = placeId && isGooglePlaceId(placeId);
    const hasCoordinates = lat !== undefined && lng !== undefined;

    if (!hasGooglePlaceId && !hasCoordinates) {
      console.log('[useCourtPhotos] No Google Place ID or coordinates available');
      setPhotoUrl(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getCachedCourtPhoto(
        courtId,
        placeId || null,
        existingPhotoUrl || null,
        lat,
        lng,
        courtName
      );

      setPhotoUrl(result.url);
      setFromCache(result.fromCache);

      if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      console.error('[useCourtPhotos] Error:', err);
      setError('Failed to fetch photo');
      setPhotoUrl(null);
    } finally {
      setLoading(false);
    }
  }, [courtId, placeId, existingPhotoUrl, lat, lng, courtName]);

  useEffect(() => {
    if (autoFetch) {
      fetchPhoto();
    }
  }, [fetchPhoto, autoFetch]);

  return {
    photoUrl,
    loading,
    error,
    fromCache,
    refetch: fetchPhoto,
  };
}

/**
 * Simplified hook when you only have a court object
 * Automatically extracts courtId, placeId, coordinates and existing photo_url
 */
export function useCourtPhoto(
  court: {
    id?: string;
    place_id?: string;
    google_place_id?: string;
    photo_url?: string | null;
    name?: string;
    lat?: number;
    lng?: number;
  } | null | undefined
): UseCourtPhotosResult {
  // Extract the Google Place ID (could be in different fields)
  const placeId = court?.google_place_id || court?.place_id || null;
  const googlePlaceId = placeId && isGooglePlaceId(placeId) ? placeId : null;

  return useCourtPhotos(
    court?.id || null,
    googlePlaceId,
    court?.photo_url || null,
    {
      lat: court?.lat,
      lng: court?.lng,
      courtName: court?.name,
    }
  );
}

export default useCourtPhotos;
