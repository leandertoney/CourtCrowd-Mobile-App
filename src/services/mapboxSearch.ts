/**
 * Mapbox Search API Service
 * Uses Mapbox Search Box API to discover nearby sports facilities/courts
 */

const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '';

// Mapbox Search Box API response types
export interface MapboxFeature {
  type: 'Feature';
  id: string;
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    mapbox_id: string;
    name: string;
    name_preferred?: string;
    address?: string;
    full_address?: string;
    place_formatted?: string;
    context?: {
      place?: {name: string};
      region?: {name: string};
      country?: {name: string};
      postcode?: {name: string};
    };
    poi_category?: string[];
    poi_category_ids?: string[];
  };
}

export interface MapboxSearchResponse {
  type: 'FeatureCollection';
  features: MapboxFeature[];
  attribution: string;
}

export interface DiscoveredCourt {
  place_id: string;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  categories: string[];
  source: 'mapbox';
}

// Categories to search for sports facilities
const SEARCH_CATEGORIES = [
  'sports_activity_location',
  'recreation_area',
  'park',
  'fitness_center',
];

// Keywords to filter results for pickleball/tennis courts
const COURT_KEYWORDS = [
  'pickleball',
  'tennis',
  'recreation center',
  'rec center',
  'sports complex',
  'athletic club',
  'racquet club',
  'paddle',
  'court',
];

/**
 * Check if a venue name likely contains courts
 */
function isLikelyCourt(name: string, categories: string[] = []): boolean {
  const lowerName = name.toLowerCase();
  const lowerCategories = categories.map(c => c.toLowerCase()).join(' ');
  const combined = `${lowerName} ${lowerCategories}`;

  return COURT_KEYWORDS.some(keyword => combined.includes(keyword));
}

/**
 * Search for nearby sports facilities using Mapbox Search Box API
 * @param latitude User's latitude
 * @param longitude User's longitude
 * @param radiusMiles Search radius in miles (default 10)
 */
export async function searchNearbyCourts(
  latitude: number,
  longitude: number,
  radiusMiles: number = 10,
): Promise<DiscoveredCourt[]> {
  const allResults: DiscoveredCourt[] = [];
  const seenIds = new Set<string>();

  // Search each category
  for (const category of SEARCH_CATEGORIES) {
    try {
      const url = buildSearchUrl(category, longitude, latitude, radiusMiles);
      const response = await fetch(url);

      if (!response.ok) {
        console.warn(`Mapbox search failed for category ${category}:`, response.status);
        continue;
      }

      const data: MapboxSearchResponse = await response.json();

      for (const feature of data.features) {
        // Skip duplicates
        if (seenIds.has(feature.properties.mapbox_id)) continue;
        seenIds.add(feature.properties.mapbox_id);

        // Filter for likely courts
        const categories = feature.properties.poi_category || [];
        if (!isLikelyCourt(feature.properties.name, categories)) continue;

        // Build address from context
        const address = buildAddress(feature);

        allResults.push({
          place_id: feature.properties.mapbox_id,
          name: feature.properties.name_preferred || feature.properties.name,
          address,
          lat: feature.geometry.coordinates[1],
          lng: feature.geometry.coordinates[0],
          categories,
          source: 'mapbox',
        });
      }
    } catch (error) {
      console.error(`Error searching category ${category}:`, error);
    }
  }

  return allResults;
}

/**
 * Build the Mapbox Search Box API URL
 */
function buildSearchUrl(
  category: string,
  lng: number,
  lat: number,
  radiusMiles: number,
): string {
  // Convert miles to meters for the API
  const radiusMeters = Math.min(radiusMiles * 1609.344, 100000); // Max 100km

  const params = new URLSearchParams({
    access_token: MAPBOX_ACCESS_TOKEN,
    proximity: `${lng},${lat}`,
    limit: '25',
    language: 'en',
    // Note: radius is approximate via proximity biasing
  });

  return `https://api.mapbox.com/search/searchbox/v1/category/${category}?${params}`;
}

/**
 * Build a formatted address from Mapbox feature context
 */
function buildAddress(feature: MapboxFeature): string | null {
  // Prefer full_address if available
  if (feature.properties.full_address) {
    return feature.properties.full_address;
  }

  if (feature.properties.place_formatted) {
    return feature.properties.place_formatted;
  }

  if (feature.properties.address) {
    return feature.properties.address;
  }

  // Build from context
  const context = feature.properties.context;
  if (!context) return null;

  const parts = [];
  if (context.place?.name) parts.push(context.place.name);
  if (context.region?.name) parts.push(context.region.name);
  if (context.postcode?.name) parts.push(context.postcode.name);

  return parts.length > 0 ? parts.join(', ') : null;
}

/**
 * Geocode an address to coordinates using Mapbox Geocoding API
 * Useful for user-submitted courts
 */
export async function geocodeAddress(
  address: string,
): Promise<{lat: number; lng: number} | null> {
  try {
    const params = new URLSearchParams({
      access_token: MAPBOX_ACCESS_TOKEN,
      limit: '1',
      language: 'en',
    });

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?${params}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.warn('Geocoding failed:', response.status);
      return null;
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return {lat, lng};
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}
