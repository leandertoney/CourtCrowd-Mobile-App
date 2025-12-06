/**
 * Court Photo Caching Service
 * Fetches photos from Google Places and caches them in Supabase Storage
 * This way we only pay Google once per court, then serve from our own storage
 */

import {supabase} from '../lib/supabase';
import {getPlaceDetails, getPhotoUrl, isGooglePlaceId, findPlaceByLocation} from './googlePlaces';

interface CacheResult {
  url: string | null;
  fromCache: boolean;
  error?: string;
}

/**
 * Get a court photo, using cache if available, otherwise fetch from Google and cache it
 * @param courtId - The court's database ID (UUID)
 * @param placeId - The Google Place ID for fetching from Google Places API
 * @param existingPhotoUrl - The current photo_url from the court record
 * @param lat - Optional latitude for looking up Google Place ID
 * @param lng - Optional longitude for looking up Google Place ID
 * @param courtName - Optional court name for better Place ID matching
 * @returns The photo URL (either cached or newly fetched)
 */
export async function getCachedCourtPhoto(
  courtId: string,
  placeId: string | null,
  existingPhotoUrl: string | null,
  lat?: number,
  lng?: number,
  courtName?: string
): Promise<CacheResult> {
  // 1. If we already have a cached photo URL, use it
  if (existingPhotoUrl) {
    console.log('[PhotoCache] Using existing cached photo for court:', courtId);
    return {url: existingPhotoUrl, fromCache: true};
  }

  // 2. If no Google Place ID, try to look it up by coordinates
  let googlePlaceId = placeId && isGooglePlaceId(placeId) ? placeId : null;

  if (!googlePlaceId && lat && lng) {
    console.log('[PhotoCache] Looking up Google Place ID by coordinates:', lat, lng);
    googlePlaceId = await findPlaceByLocation(lat, lng, courtName);

    if (googlePlaceId) {
      console.log('[PhotoCache] Found Google Place ID:', googlePlaceId);
      // Save the Google Place ID to the court record for future use
      await supabase
        .from('courts')
        .update({google_place_id: googlePlaceId})
        .eq('id', courtId);
    }
  }

  // 3. If still no Google Place ID, we can't fetch from Google
  if (!googlePlaceId) {
    console.log('[PhotoCache] No valid Google Place ID for court:', courtId);
    return {url: null, fromCache: false, error: 'No Google Place ID'};
  }

  // 4. Fetch from Google Places and cache it
  try {
    console.log('[PhotoCache] Fetching from Google Places for court:', courtId);

    // Get photo details from Google
    const details = await getPlaceDetails(googlePlaceId);

    if (!details || !details.photos || details.photos.length === 0) {
      console.log('[PhotoCache] No photos available from Google Places');
      return {url: null, fromCache: false, error: 'No photos available'};
    }

    // Get the photo URL from Google
    const googlePhotoUrl = getPhotoUrl(details.photos[0].photoReference, 800);

    if (!googlePhotoUrl) {
      return {url: null, fromCache: false, error: 'Could not generate photo URL'};
    }

    // Save the Google photo URL to the court record for future use
    await supabase
      .from('courts')
      .update({photo_url: googlePhotoUrl})
      .eq('id', courtId);

    console.log('[PhotoCache] Saved photo URL for court:', courtId);
    return {url: googlePhotoUrl, fromCache: false};
  } catch (error) {
    console.error('[PhotoCache] Error caching photo:', error);
    return {url: null, fromCache: false, error: String(error)};
  }
}

/**
 * Check if a court has a cached photo
 */
export async function hasCachedPhoto(courtId: string): Promise<boolean> {
  try {
    const {data, error} = await supabase
      .from('courts')
      .select('photo_url')
      .eq('id', courtId)
      .single();

    if (error || !data) return false;
    return Boolean(data.photo_url);
  } catch {
    return false;
  }
}

/**
 * Manually cache a photo for a court (useful for batch operations)
 */
export async function cacheCourtPhoto(
  courtId: string,
  placeId: string
): Promise<string | null> {
  const result = await getCachedCourtPhoto(courtId, placeId, null);
  return result.url;
}

/**
 * Delete a cached photo (if user wants to refresh it)
 */
export async function deleteCachedPhoto(courtId: string): Promise<boolean> {
  try {
    // Try both extensions
    const extensions = ['jpg', 'png'];

    for (const ext of extensions) {
      await supabase.storage
        .from(BUCKET_NAME)
        .remove([`${courtId}.${ext}`]);
    }

    // Clear the photo_url in the database
    await supabase
      .from('courts')
      .update({photo_url: null})
      .eq('id', courtId);

    return true;
  } catch (error) {
    console.error('[PhotoCache] Error deleting cached photo:', error);
    return false;
  }
}
