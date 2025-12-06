/**
 * Google Places API Service
 * Fetches court photos using Google Place IDs from Radar geofences
 */

const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || '';

export interface PlacePhoto {
  photoReference: string;
  width: number;
  height: number;
  attributions: string[];
}

export interface PlaceDetails {
  name: string;
  formattedAddress?: string;
  photos: PlacePhoto[];
  rating?: number;
  userRatingsTotal?: number;
  openingHours?: {
    openNow: boolean;
    weekdayText: string[];
  };
}

/**
 * Get place details including photos from Google Places API
 * @param placeId - Google Place ID (from Radar geofence externalId)
 * @returns Place details with photo references
 */
export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  if (!GOOGLE_PLACES_API_KEY) {
    console.error('[GooglePlaces] No API key configured');
    return null;
  }

  try {
    const fields = 'name,photos,formatted_address,rating,user_ratings_total,opening_hours';
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_PLACES_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('[GooglePlaces] API error:', data.status, data.error_message);
      return null;
    }

    const result = data.result;
    return {
      name: result.name,
      formattedAddress: result.formatted_address,
      photos: (result.photos || []).map((photo: any) => ({
        photoReference: photo.photo_reference,
        width: photo.width,
        height: photo.height,
        attributions: photo.html_attributions || [],
      })),
      rating: result.rating,
      userRatingsTotal: result.user_ratings_total,
      openingHours: result.opening_hours
        ? {
            openNow: result.opening_hours.open_now,
            weekdayText: result.opening_hours.weekday_text || [],
          }
        : undefined,
    };
  } catch (error) {
    console.error('[GooglePlaces] Error fetching place details:', error);
    return null;
  }
}

/**
 * Get a photo URL from a photo reference
 * @param photoReference - Photo reference from getPlaceDetails
 * @param maxWidth - Maximum width of the photo (default 400)
 * @returns Direct URL to the photo
 */
export function getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
  if (!GOOGLE_PLACES_API_KEY || !photoReference) {
    return '';
  }
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
}

/**
 * Get multiple photo URLs for a place
 * @param placeId - Google Place ID
 * @param maxPhotos - Maximum number of photos to return (default 5)
 * @param maxWidth - Maximum width of each photo (default 400)
 * @returns Array of photo URLs
 */
export async function getPlacePhotos(
  placeId: string,
  maxPhotos: number = 5,
  maxWidth: number = 400
): Promise<string[]> {
  const details = await getPlaceDetails(placeId);
  if (!details || !details.photos.length) {
    return [];
  }

  return details.photos
    .slice(0, maxPhotos)
    .map(photo => getPhotoUrl(photo.photoReference, maxWidth));
}

/**
 * Get the primary (first) photo URL for a place
 * @param placeId - Google Place ID
 * @param maxWidth - Maximum width of the photo (default 400)
 * @returns Photo URL or null if no photos available
 */
export async function getPrimaryPhoto(
  placeId: string,
  maxWidth: number = 400
): Promise<string | null> {
  const photos = await getPlacePhotos(placeId, 1, maxWidth);
  return photos.length > 0 ? photos[0] : null;
}

/**
 * Check if a string looks like a Google Place ID
 * Google Place IDs typically start with "ChIJ"
 */
export function isGooglePlaceId(id: string): boolean {
  return id?.startsWith('ChIJ') || false;
}

/**
 * Search for a place by coordinates and name
 * Returns the Google Place ID if found
 * @param lat - Latitude
 * @param lng - Longitude
 * @param name - Place name to help match
 * @param radiusMeters - Search radius (default 100m)
 */
export async function findPlaceByLocation(
  lat: number,
  lng: number,
  name?: string,
  radiusMeters: number = 100
): Promise<string | null> {
  if (!GOOGLE_PLACES_API_KEY) {
    console.error('[GooglePlaces] No API key configured');
    return null;
  }

  try {
    // Use Nearby Search with location
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusMeters}&key=${GOOGLE_PLACES_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('[GooglePlaces] Nearby search error:', data.status, data.error_message);
      return null;
    }

    if (!data.results || data.results.length === 0) {
      // Try with larger radius
      if (radiusMeters < 500) {
        return findPlaceByLocation(lat, lng, name, 500);
      }
      return null;
    }

    // If we have a name, try to find best match
    if (name) {
      const lowerName = name.toLowerCase();
      const match = data.results.find((place: any) =>
        place.name?.toLowerCase().includes(lowerName) ||
        lowerName.includes(place.name?.toLowerCase())
      );
      if (match) {
        console.log('[GooglePlaces] Found match by name:', match.name, match.place_id);
        return match.place_id;
      }
    }

    // Return first result (closest to coordinates)
    const firstResult = data.results[0];
    console.log('[GooglePlaces] Using closest result:', firstResult.name, firstResult.place_id);
    return firstResult.place_id;
  } catch (error) {
    console.error('[GooglePlaces] Error in nearby search:', error);
    return null;
  }
}

/**
 * Search for pickleball courts near a location
 * @param lat - Latitude
 * @param lng - Longitude
 * @param radiusMeters - Search radius (default 16km)
 */
export async function searchPickleballCourts(
  lat: number,
  lng: number,
  radiusMeters: number = 16000
): Promise<Array<{
  placeId: string;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  photos: PlacePhoto[];
}>> {
  if (!GOOGLE_PLACES_API_KEY) {
    console.error('[GooglePlaces] No API key configured');
    return [];
  }

  try {
    // Use Text Search with pickleball keyword
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=pickleball+court&location=${lat},${lng}&radius=${radiusMeters}&key=${GOOGLE_PLACES_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('[GooglePlaces] Text search error:', data.status, data.error_message);
      return [];
    }

    return (data.results || []).map((place: any) => ({
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address || null,
      lat: place.geometry?.location?.lat,
      lng: place.geometry?.location?.lng,
      photos: (place.photos || []).map((photo: any) => ({
        photoReference: photo.photo_reference,
        width: photo.width,
        height: photo.height,
        attributions: photo.html_attributions || [],
      })),
    }));
  } catch (error) {
    console.error('[GooglePlaces] Error searching courts:', error);
    return [];
  }
}
