import { NewsScraperService } from './newsScraperService';
import { GeocodingService } from './geocodingService';
import { newsCache } from './newsCache';
import OpenAI from 'openai';
import type { RawStory, EnrichedStory, GeolocatedStory } from './types';

/**
 * Main aggregator that orchestrates news scraping, enrichment, and geocoding
 */
export class NewsAggregator {
  private scraper: NewsScraperService;
  private geocoder: GeocodingService;
  private openai: OpenAI;

  constructor(openaiKey: string, newsAPIKey?: string) {
    this.scraper = new NewsScraperService(newsAPIKey);
    this.geocoder = new GeocodingService(openaiKey);
    this.openai = new OpenAI({ apiKey: openaiKey });
  }

  /**
   * Enrich raw stories with location, category, and summary using AI
   */
  private async enrichStories(stories: RawStory[]): Promise<EnrichedStory[]> {
    if (stories.length === 0) {
      return [];
    }

    console.log(`Enriching ${stories.length} stories...`);

    // Process in batches to avoid token limits
    const batchSize = 10;
    const enrichedStories: EnrichedStory[] = [];

    for (let i = 0; i < stories.length; i += batchSize) {
      const batch = stories.slice(i, i + batchSize);

      try {
        const prompt = `
Analyze these news stories and extract for each:
1. Primary location (specific city and country if mentioned, otherwise country or region)
2. A concise 20-25 word summary of the key facts
3. Category: choose ONE from [politics, conflict, environment, tech, health, economy]
4. Urgency: choose ONE from [breaking, recent, standard] based on recency and importance

Return a JSON object with a "results" array containing objects with this structure:
{
  "results": [
    {
      "location": "City, Country",
      "summary": "concise summary here",
      "category": "category_name",
      "urgency": "urgency_level"
    }
  ]
}

Stories:
${JSON.stringify(batch.map(s => ({
  title: s.title,
  description: s.description,
  publishedAt: s.publishedAt,
})))}
`;

        const response = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a news analysis assistant. Always respond with valid JSON in the exact format requested.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        });

        const enrichedData = JSON.parse(
          response.choices[0].message.content || '{"results": []}'
        );

        // Merge enriched data with original stories
        const batchEnriched: EnrichedStory[] = batch.map((story, index) => ({
          ...story,
          location: enrichedData.results?.[index]?.location || 'Unknown Location',
          summary: enrichedData.results?.[index]?.summary || story.description,
          category: enrichedData.results?.[index]?.category || 'politics',
          urgency: enrichedData.results?.[index]?.urgency || 'standard',
        }));

        enrichedStories.push(...batchEnriched);

        // Rate limiting delay between batches
        if (i + batchSize < stories.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error('Error enriching batch:', error);
        // Fallback to basic enrichment
        const fallbackEnriched: EnrichedStory[] = batch.map(story => ({
          ...story,
          location: 'Unknown Location',
          summary: story.description,
          category: 'politics' as const,
          urgency: 'standard' as const,
        }));
        enrichedStories.push(...fallbackEnriched);
      }
    }

    console.log(`Successfully enriched ${enrichedStories.length} stories`);
    return enrichedStories;
  }

  /**
   * Main method to fetch, enrich, geocode, and cache news
   */
  async aggregateNews(useCache: boolean = true): Promise<GeolocatedStory[]> {
    try {
      // Check cache first
      if (useCache) {
        const cached = newsCache.get('global');
        if (cached) {
          return cached;
        }
      }

      console.log('Starting news aggregation pipeline...');

      // Step 1: Scrape raw news
      console.log('Step 1: Scraping news...');
      const rawStories = await this.scraper.fetchNews();

      if (rawStories.length === 0) {
        console.warn('No stories fetched from sources');
        return [];
      }

      // Step 2: Enrich with AI
      console.log('Step 2: Enriching stories with AI...');
      const enrichedStories = await this.enrichStories(rawStories);

      // Step 3: Geocode locations
      console.log('Step 3: Geocoding locations...');
      const geolocatedStories = await this.geocoder.geolocateStories(enrichedStories);

      // Filter out stories with unknown locations (0,0 coordinates)
      const validStories = geolocatedStories.filter(
        story => story.coords.lat !== 0 || story.coords.lng !== 0
      );

      console.log(`Pipeline complete: ${validStories.length} valid stories`);

      // Cache the results
      newsCache.set(validStories, 'global');

      return validStories;
    } catch (error) {
      console.error('Error in news aggregation pipeline:', error);
      throw error;
    }
  }

  /**
   * Fetch news for specific countries
   */
  async aggregateNewsByCountries(
    countryCodes: string[],
    useCache: boolean = true
  ): Promise<GeolocatedStory[]> {
    const cacheKey = `countries:${countryCodes.join(',')}`;

    // Check cache
    if (useCache) {
      const cached = newsCache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Fetch country-specific news
    const rawStories = await this.scraper.fetchNewsByCountries(countryCodes);
    const enrichedStories = await this.enrichStories(rawStories);
    const geolocatedStories = await this.geocoder.geolocateStories(enrichedStories);

    // Cache and return
    newsCache.set(geolocatedStories, cacheKey);
    return geolocatedStories;
  }

  /**
   * Force refresh cache
   */
  async refreshCache(): Promise<GeolocatedStory[]> {
    newsCache.clear();
    return this.aggregateNews(false);
  }

  /**
   * Stream news stories as they're processed
   */
  async aggregateNewsStreaming(
    useCache: boolean = true,
    onStory: (story: GeolocatedStory) => void
  ): Promise<void> {
    try {
      // Check cache first
      if (useCache) {
        const cached = newsCache.get('global');
        if (cached) {
          // Stream cached stories quickly
          for (const story of cached) {
            onStory(story);
            await new Promise(resolve => setTimeout(resolve, 50));
          }
          return;
        }
      }

      console.log('Starting streaming news aggregation pipeline...');

      // Step 1: Scrape raw news
      console.log('Step 1: Scraping news...');
      const rawStories = await this.scraper.fetchNews();

      if (rawStories.length === 0) {
        console.warn('No stories fetched from sources');
        return;
      }

      // Step 2 & 3: Enrich and geocode stories incrementally
      console.log('Step 2 & 3: Processing stories incrementally...');
      const allStories: GeolocatedStory[] = [];

      // Process in small batches for faster initial results
      const batchSize = 5;
      for (let i = 0; i < rawStories.length; i += batchSize) {
        const batch = rawStories.slice(i, i + batchSize);

        // Enrich batch
        const enrichedBatch = await this.enrichStoriesBatch(batch);

        // Geocode batch
        const geolocatedBatch = await this.geocoder.geolocateStories(enrichedBatch);

        // Filter and stream valid stories
        const validStories = geolocatedBatch.filter(
          story => story.coords.lat !== 0 || story.coords.lng !== 0
        );

        for (const story of validStories) {
          onStory(story);
          allStories.push(story);
        }
      }

      console.log(`Streaming complete: ${allStories.length} valid stories`);

      // Cache the results
      newsCache.set(allStories, 'global');
    } catch (error) {
      console.error('Error in streaming news aggregation pipeline:', error);
      throw error;
    }
  }

  /**
   * Enrich a single batch of stories (helper for streaming)
   */
  private async enrichStoriesBatch(stories: RawStory[]): Promise<EnrichedStory[]> {
    if (stories.length === 0) {
      return [];
    }

    try {
      const prompt = `
Analyze these news stories and extract for each:
1. Primary location (specific city and country if mentioned, otherwise country or region)
2. A concise 20-25 word summary of the key facts
3. Category: choose ONE from [politics, conflict, environment, tech, health, economy]
4. Urgency: choose ONE from [breaking, recent, standard] based on recency and importance

Return a JSON object with a "results" array containing objects with this structure:
{
  "results": [
    {
      "location": "City, Country",
      "summary": "concise summary here",
      "category": "category_name",
      "urgency": "urgency_level"
    }
  ]
}

Stories:
${JSON.stringify(stories.map(s => ({
  title: s.title,
  description: s.description,
  publishedAt: s.publishedAt,
})))}
`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a news analysis assistant. Always respond with valid JSON in the exact format requested.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const enrichedData = JSON.parse(
        response.choices[0].message.content || '{"results": []}'
      );

      // Merge enriched data with original stories
      return stories.map((story, index) => ({
        ...story,
        location: enrichedData.results?.[index]?.location || 'Unknown Location',
        summary: enrichedData.results?.[index]?.summary || story.description,
        category: enrichedData.results?.[index]?.category || 'politics',
        urgency: enrichedData.results?.[index]?.urgency || 'standard',
      }));
    } catch (error) {
      console.error('Error enriching batch:', error);
      // Fallback to basic enrichment
      return stories.map(story => ({
        ...story,
        location: 'Unknown Location',
        summary: story.description,
        category: 'politics' as const,
        urgency: 'standard' as const,
      }));
    }
  }
}
