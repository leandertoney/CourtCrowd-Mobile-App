/**
 * Radar Search API Service
 * Uses Radar Places API to discover nearby pickleball courts
 * Docs: https://radar.com/documentation/api
 */

const RADAR_API_KEY = process.env.EXPO_PUBLIC_RADAR_API_KEY || '';

// Radar API response types
interface RadarPlace {
  _id: string;
  name: string;
  categories: string[];
  chain?: {
    name: string;
    slug: string;
  };
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  formattedAddress?: string;
  city?: string;
  state?: string;
  stateCode?: string;
  postalCode?: string;
  country?: string;
  countryCode?: string;
}

interface RadarSearchResponse {
  meta: {
    code: number;
  };
  places: RadarPlace[];
}

export interface DiscoveredCourt {
  place_id: string;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  categories: string[];
  source: 'radar';
}

// Radar categories for sports facilities
// From: https://radar.com/documentation/places/categories
const RADAR_CATEGORIES = [
  'tennis-court',
  'recreation-fitness-venue',
  'sports-recreation',
  'gym-fitness-center',
  'stadium-arena-sports-venue',
];

// Text search queries - pickleball only
const SEARCH_QUERIES = [
  'pickleball',
  'pickleball court',
  'pickleball courts',
];

// Keywords to identify pickleball courts from category search results
// Only pickleball - no tennis or other sports
const PICKLEBALL_KEYWORDS = [
  'pickleball',
  'pickle ball',
  'pickle-ball',
];

/**
 * Check if a place is likely a pickleball court
 * Used to filter category search results - only returns true if "pickleball" is in the name
 */
function isPickleballCourt(name: string, categories: string[] = []): boolean {
  const lowerName = name.toLowerCase();
  const lowerCategories = categories.map(c => c.toLowerCase());
  const combinedText = `${lowerName} ${lowerCategories.join(' ')}`;

  return PICKLEBALL_KEYWORDS.some(keyword => combinedText.includes(keyword));
}

/**
 * Search for nearby courts using Radar Places API
 * @param latitude User's latitude
 * @param longitude User's longitude
 * @param radiusMeters Search radius in meters (default ~16km / 10 miles)
 */
export async function searchNearbyCourts(
  latitude: number,
  longitude: number,
  radiusMeters: number = 16000,
): Promise<DiscoveredCourt[]> {
  const allResults: DiscoveredCourt[] = [];
  const seenIds = new Set<string>();

  // Method 1: Category-based search
  // These are broad sports categories, so we filter strictly for "pickleball" in the name
  for (const category of RADAR_CATEGORIES) {
    try {
      const places = await searchByCategory(latitude, longitude, category, radiusMeters);
      console.log(`[Radar] Category "${category}" returned ${places.length} results`);

      for (const place of places) {
        if (seenIds.has(place._id)) continue;

        // Filter for pickleball courts only (strict filter for category search)
        if (!isPickleballCourt(place.name, place.categories)) {
          continue;
        }

        seenIds.add(place._id);
        console.log(`[Radar] Adding from category search: ${place.name}`);
        allResults.push(transformPlace(place));
      }
    } catch (error) {
      console.warn(`Radar category search failed for ${category}:`, error);
    }
  }

  // Method 2: Text-based search for "pickleball"
  // Trust Radar's results here - if it returns a place for "pickleball" search,
  // that place likely has pickleball courts even if "pickleball" isn't in the name
  // (e.g., "Central Park Recreation Center" might have pickleball courts)
  for (const query of SEARCH_QUERIES) {
    try {
      const places = await searchByText(latitude, longitude, query, radiusMeters);
      console.log(`[Radar] Text search "${query}" returned ${places.length} results`);

      for (const place of places) {
        if (seenIds.has(place._id)) continue;
        seenIds.add(place._id);

        console.log(`[Radar] Adding from text search: ${place.name}`);
        allResults.push(transformPlace(place));
      }
    } catch (error) {
      console.warn(`Radar text search failed for "${query}":`, error);
    }
  }

  console.log(`[Radar] Found ${allResults.length} pickleball courts near ${latitude},${longitude}`);
  return allResults;
}

/**
 * Search places by category
 */
async function searchByCategory(
  lat: number,
  lng: number,
  category: string,
  radius: number,
): Promise<RadarPlace[]> {
  const params = new URLSearchParams({
    near: `${lat},${lng}`,
    radius: radius.toString(),
    categories: category,
    limit: '100',
  });

  const response = await fetch(
    `https://api.radar.io/v1/search/places?${params}`,
    {
      headers: {
        Authorization: RADAR_API_KEY,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Radar API error: ${response.status}`);
  }

  const data: RadarSearchResponse = await response.json();
  return data.places || [];
}

/**
 * Search places by text query
 */
async function searchByText(
  lat: number,
  lng: number,
  query: string,
  radius: number,
): Promise<RadarPlace[]> {
  const params = new URLSearchParams({
    near: `${lat},${lng}`,
    radius: radius.toString(),
    query: query,
    limit: '50',
  });

  const response = await fetch(
    `https://api.radar.io/v1/search/places?${params}`,
    {
      headers: {
        Authorization: RADAR_API_KEY,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Radar API error: ${response.status}`);
  }

  const data: RadarSearchResponse = await response.json();
  return data.places || [];
}

/**
 * Transform Radar place to our court format
 */
function transformPlace(place: RadarPlace): DiscoveredCourt {
  // Build address from available fields
  let address: string | null = null;
  if (place.formattedAddress) {
    address = place.formattedAddress;
  } else if (place.city && place.state) {
    address = `${place.city}, ${place.stateCode || place.state}`;
  }

  return {
    place_id: `radar_${place._id}`,
    name: place.name,
    address,
    lat: place.location.coordinates[1],
    lng: place.location.coordinates[0],
    categories: place.categories || [],
    source: 'radar',
  };
}

/**
 * Geocode an address to coordinates
 */
export async function geocodeAddress(
  address: string,
): Promise<{lat: number; lng: number} | null> {
  try {
    const params = new URLSearchParams({
      query: address,
    });

    const response = await fetch(
      `https://api.radar.io/v1/geocode/forward?${params}`,
      {
        headers: {
          Authorization: RADAR_API_KEY,
        },
      },
    );

    if (!response.ok) {
      console.warn('Radar geocoding failed:', response.status);
      return null;
    }

    const data = await response.json();

    if (data.addresses && data.addresses.length > 0) {
      const location = data.addresses[0].geometry.coordinates;
      return {
        lat: location[1],
        lng: location[0],
      };
    }

    return null;
  } catch (error) {
    console.error('Radar geocoding error:', error);
    return null;
  }
}
