import OpenAI from 'openai';
import type { EnrichedStory, GeolocatedStory } from './types';

interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Service for converting location strings to geographic coordinates
 */
export class GeocodingService {
  private openai: OpenAI;
  private cache: Map<string, Coordinates>;

  // Fallback coordinates for major world regions
  private readonly FALLBACK_COORDS: Record<string, Coordinates> = {
    'Unknown': { lat: 0, lng: 0 },
    'United States': { lat: 37.0902, lng: -95.7129 },
    'United Kingdom': { lat: 55.3781, lng: -3.4360 },
    'France': { lat: 46.2276, lng: 2.2137 },
    'Germany': { lat: 51.1657, lng: 10.4515 },
    'China': { lat: 35.8617, lng: 104.1954 },
    'Japan': { lat: 36.2048, lng: 138.2529 },
    'India': { lat: 20.5937, lng: 78.9629 },
    'Brazil': { lat: -14.2350, lng: -51.9253 },
    'Australia': { lat: -25.2744, lng: 133.7751 },
    'Russia': { lat: 61.5240, lng: 105.3188 },
    'Canada': { lat: 56.1304, lng: -106.3468 },
    'Mexico': { lat: 23.6345, lng: -102.5528 },
    'South Africa': { lat: -30.5595, lng: 22.9375 },
    'Egypt': { lat: 26.8206, lng: 30.8025 },
  };

  // Major city coordinates
  private readonly CITY_COORDS: Record<string, Coordinates> = {
    'New York': { lat: 40.7128, lng: -74.0060 },
    'London': { lat: 51.5074, lng: -0.1278 },
    'Paris': { lat: 48.8566, lng: 2.3522 },
    'Tokyo': { lat: 35.6762, lng: 139.6503 },
    'Beijing': { lat: 39.9042, lng: 116.4074 },
    'Moscow': { lat: 55.7558, lng: 37.6173 },
    'Berlin': { lat: 52.5200, lng: 13.4050 },
    'Sydney': { lat: -33.8688, lng: 151.2093 },
    'Mumbai': { lat: 19.0760, lng: 72.8777 },
    'Dubai': { lat: 25.2048, lng: 55.2708 },
    'Singapore': { lat: 1.3521, lng: 103.8198 },
    'Hong Kong': { lat: 22.3193, lng: 114.1694 },
    'Toronto': { lat: 43.6532, lng: -79.3832 },
    'Mexico City': { lat: 19.4326, lng: -99.1332 },
    'São Paulo': { lat: -23.5505, lng: -46.6333 },
    'Los Angeles': { lat: 34.0522, lng: -118.2437 },
    'Chicago': { lat: 41.8781, lng: -87.6298 },
    'San Francisco': { lat: 37.7749, lng: -122.4194 },
    'Boston': { lat: 42.3601, lng: -71.0589 },
    'Washington': { lat: 38.9072, lng: -77.0369 },
    'Seoul': { lat: 37.5665, lng: 126.9780 },
    'Bangkok': { lat: 13.7563, lng: 100.5018 },
    'Istanbul': { lat: 41.0082, lng: 28.9784 },
    'Cairo': { lat: 30.0444, lng: 31.2357 },
    'Rome': { lat: 41.9028, lng: 12.4964 },
    'Madrid': { lat: 40.4168, lng: -3.7038 },
    'Amsterdam': { lat: 52.3676, lng: 4.9041 },
    'Geneva': { lat: 46.2044, lng: 6.1432 },
    'Zurich': { lat: 47.3769, lng: 8.5417 },
    'Brussels': { lat: 50.8503, lng: 4.3517 },
    'Vienna': { lat: 48.2082, lng: 16.3738 },
    'Warsaw': { lat: 52.2297, lng: 21.0122 },
    'Stockholm': { lat: 59.3293, lng: 18.0686 },
    'Copenhagen': { lat: 55.6761, lng: 12.5683 },
    'Oslo': { lat: 59.9139, lng: 10.7522 },
    'Helsinki': { lat: 60.1699, lng: 24.9384 },
    'Athens': { lat: 37.9838, lng: 23.7275 },
    'Lisbon': { lat: 38.7223, lng: -9.1393 },
    'Dublin': { lat: 53.3498, lng: -6.2603 },
    'Tel Aviv': { lat: 32.0853, lng: 34.7818 },
    'Jerusalem': { lat: 31.7683, lng: 35.2137 },
    'Riyadh': { lat: 24.7136, lng: 46.6753 },
    'Abu Dhabi': { lat: 24.4539, lng: 54.3773 },
    'Doha': { lat: 25.2854, lng: 51.5310 },
    'Kuwait City': { lat: 29.3759, lng: 47.9774 },
    'Beirut': { lat: 33.8886, lng: 35.4955 },
    'Baghdad': { lat: 33.3152, lng: 44.3661 },
    'Tehran': { lat: 35.6892, lng: 51.3890 },
    'Kabul': { lat: 34.5553, lng: 69.2075 },
    'Islamabad': { lat: 33.6844, lng: 73.0479 },
    'New Delhi': { lat: 28.6139, lng: 77.2090 },
    'Dhaka': { lat: 23.8103, lng: 90.4125 },
    'Yangon': { lat: 16.8661, lng: 96.1951 },
    'Hanoi': { lat: 21.0285, lng: 105.8542 },
    'Ho Chi Minh City': { lat: 10.8231, lng: 106.6297 },
    'Manila': { lat: 14.5995, lng: 120.9842 },
    'Jakarta': { lat: -6.2088, lng: 106.8456 },
    'Kuala Lumpur': { lat: 3.1390, lng: 101.6869 },
    'Nairobi': { lat: -1.2921, lng: 36.8219 },
    'Lagos': { lat: 6.5244, lng: 3.3792 },
    'Johannesburg': { lat: -26.2041, lng: 28.0473 },
    'Cape Town': { lat: -33.9249, lng: 18.4241 },
    'Buenos Aires': { lat: -34.6037, lng: -58.3816 },
    'Santiago': { lat: -33.4489, lng: -70.6693 },
    'Lima': { lat: -12.0464, lng: -77.0428 },
    'Bogotá': { lat: 4.7110, lng: -74.0721 },
    'Caracas': { lat: 10.4806, lng: -66.9036 },
    'Rio de Janeiro': { lat: -22.9068, lng: -43.1729 },
    'Brasília': { lat: -15.8267, lng: -47.9218 },
    'Melbourne': { lat: -37.8136, lng: 144.9631 },
    'Brisbane': { lat: -27.4698, lng: 153.0251 },
    'Perth': { lat: -31.9505, lng: 115.8605 },
    'Auckland': { lat: -36.8485, lng: 174.7633 },
    'Wellington': { lat: -41.2865, lng: 174.7762 },
  };

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
    this.cache = new Map();
  }

  /**
   * Try to find coordinates from cache
   */
  private findInCache(location: string): Coordinates | null {
    // Normalize location string
    const normalized = location.trim();

    // Check exact match
    if (this.cache.has(normalized)) {
      return this.cache.get(normalized)!;
    }

    // Check city database
    for (const [city, coords] of Object.entries(this.CITY_COORDS)) {
      if (normalized.includes(city)) {
        this.cache.set(normalized, coords);
        return coords;
      }
    }

    // Check country database
    for (const [country, coords] of Object.entries(this.FALLBACK_COORDS)) {
      if (normalized.includes(country)) {
        this.cache.set(normalized, coords);
        return coords;
      }
    }

    return null;
  }

  /**
   * Use OpenAI to geocode location
   */
  private async geocodeWithAI(location: string): Promise<Coordinates> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a geocoding assistant. Return only valid JSON with lat and lng coordinates for the given location. If uncertain, provide the capital city or major city of the mentioned country/region.',
          },
          {
            role: 'user',
            content: `What are the latitude and longitude coordinates for: ${location}? Return only JSON in this format: {"lat": number, "lng": number}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0,
      });

      const coords = JSON.parse(response.choices[0].message.content || '{}');

      if (coords.lat && coords.lng) {
        // Validate coordinates are within valid ranges
        if (
          coords.lat >= -90 && coords.lat <= 90 &&
          coords.lng >= -180 && coords.lng <= 180
        ) {
          this.cache.set(location, coords);
          return coords;
        }
      }

      throw new Error('Invalid coordinates from AI');
    } catch (error) {
      console.error(`AI geocoding failed for "${location}":`, error);
      return this.FALLBACK_COORDS['Unknown'];
    }
  }

  /**
   * Convert a location string to coordinates
   */
  async geocode(location: string): Promise<Coordinates> {
    // Try cache first
    const cached = this.findInCache(location);
    if (cached) {
      return cached;
    }

    // Use AI as fallback
    return this.geocodeWithAI(location);
  }

  /**
   * Convert enriched stories to geolocated stories
   */
  async geolocateStories(stories: EnrichedStory[]): Promise<GeolocatedStory[]> {
    console.log(`Geolocating ${stories.length} stories...`);

    const geolocatedStories = await Promise.all(
      stories.map(async (story) => {
        const coords = await this.geocode(story.location);
        return {
          ...story,
          coords,
        };
      })
    );

    console.log(`Successfully geolocated ${geolocatedStories.length} stories`);
    return geolocatedStories;
  }

  /**
   * Batch geocode with rate limiting (10 per second)
   */
  async geolocateStoriesBatch(
    stories: EnrichedStory[],
    batchSize: number = 10
  ): Promise<GeolocatedStory[]> {
    const results: GeolocatedStory[] = [];

    for (let i = 0; i < stories.length; i += batchSize) {
      const batch = stories.slice(i, i + batchSize);
      const batchResults = await this.geolocateStories(batch);
      results.push(...batchResults);

      // Rate limiting delay
      if (i + batchSize < stories.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }
}
