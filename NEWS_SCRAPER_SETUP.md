# News Scraper Agent Setup Guide

This guide explains how to set up the automated news scraping agent to populate your News Globe with real-time global news stories.

## Architecture Overview

The news scraping system consists of several integrated services:

1. **NewsScraperService** - Fetches news from RSS feeds and NewsAPI
2. **GeocodingService** - Converts location strings to coordinates using AI
3. **NewsAggregator** - Orchestrates the entire pipeline
4. **NewsCache** - Caches results to reduce API calls

## Quick Start

### 1. Get API Keys

#### OpenAI API Key (REQUIRED)
Used for AI-powered story enrichment and geocoding.

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (starts with `sk-`)

#### NewsAPI Key (OPTIONAL)
Enhances news coverage with additional sources.

1. Go to https://newsapi.org/register
2. Sign up for a free account
3. Copy your API key

**Note:** The free tier of NewsAPI has limitations (100 requests/day). The system works fine without it using RSS feeds.

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your keys:

```env
OPENAI_API_KEY=sk-your-actual-openai-key-here
NEWS_API_KEY=your-newsapi-key-here  # Optional
```

**Important:** Never commit `.env.local` to version control!

### 3. Run the Application

```bash
npm run dev
```

The app will now:
- Automatically fetch news from RSS feeds on load
- Enrich stories with AI (location, category, summary)
- Geocode locations to map coordinates
- Cache results for 10 minutes

## How It Works

### News Scraping Pipeline

```
1. Fetch Raw News
   ├─ RSS Feeds (BBC, NYT, Al Jazeera, Reuters, etc.)
   └─ NewsAPI (if key provided)

2. Enrich Stories (AI-powered)
   ├─ Extract primary location
   ├─ Generate concise summary
   ├─ Categorize (politics, tech, health, etc.)
   └─ Determine urgency (breaking, recent, standard)

3. Geocode Locations
   ├─ Check cache (major cities/countries)
   └─ Use AI for unknown locations

4. Cache Results
   └─ 10-minute TTL
```

### RSS News Sources

The scraper automatically fetches from these global sources:

- BBC World News
- New York Times World
- Al Jazeera
- The Guardian World
- Reuters World News
- Washington Post World
- Financial Times
- South China Morning Post
- The Hindu International
- Sydney Morning Herald

### Story Enrichment

Each story is enriched with:

- **Location**: Specific city and country
- **Summary**: AI-generated 20-25 word summary
- **Category**: One of 6 categories (politics, conflict, environment, tech, health, economy)
- **Urgency**: Breaking, recent, or standard

### Geocoding

Locations are converted to coordinates using:

1. **Cache lookup** - 100+ major cities pre-cached
2. **AI geocoding** - GPT-4o-mini for unknown locations
3. **Fallback** - Country-level coordinates if city unknown

## API Endpoints

### GET /api/news

Fetch all news stories.

**Query Parameters:**
- `refresh=true` - Force cache refresh (bypasses 10-min cache)

**Response:**
```json
{
  "success": true,
  "stories": [...],
  "count": 47,
  "lastUpdated": "2025-10-18T...",
  "mode": "live"  // or "mock" if no API key
}
```

## Customization

### Adding More RSS Feeds

Edit `lib/newsScraperService.ts`:

```typescript
private readonly RSS_FEEDS = [
  'https://feeds.bbci.co.uk/news/world/rss.xml',
  'https://your-custom-feed.com/rss.xml',  // Add here
  // ...
];
```

### Adjusting Cache Duration

Edit `lib/newsCache.ts`:

```typescript
export const newsCache = new NewsCache(10); // Change from 10 minutes
```

### Modifying News Categories

Edit `lib/types.ts`:

```typescript
export type NewsCategory =
  'politics' | 'conflict' | 'environment' |
  'tech' | 'health' | 'economy' |
  'sports'; // Add new categories
```

### Country-Specific News

The system can fetch news for specific countries:

```typescript
const aggregator = new NewsAggregator(openaiKey, newsAPIKey);
const stories = await aggregator.aggregateNewsByCountries([
  'us', 'gb', 'fr', 'de', 'jp', 'cn'
]);
```

## Performance & Costs

### API Usage

**OpenAI (GPT-4o-mini):**
- ~$0.15 per 1M input tokens
- ~$0.60 per 1M output tokens
- Typical cost per batch (10 stories): ~$0.001-0.002

**NewsAPI (Free Tier):**
- 100 requests/day
- Developer accounts only
- No commercial use

### Caching Strategy

- **Cache TTL**: 10 minutes
- **Typical cache hit rate**: 90%+ after initial load
- **Memory usage**: ~1MB per 100 stories

### Rate Limiting

- **OpenAI**: Automatic 1-second delay between batches
- **RSS Feeds**: 10-second timeout per feed
- **NewsAPI**: Respects rate limits automatically

## Troubleshooting

### "Using mock data" message

**Cause:** No `OPENAI_API_KEY` in environment
**Solution:** Add your OpenAI API key to `.env.local`

### Stories not geolocating correctly

**Cause:** AI couldn't determine location from story
**Solution:** Stories will fall back to (0,0) and be filtered out

### Rate limit errors

**Cause:** Too many API calls too quickly
**Solution:** System automatically handles rate limiting, but you can:
- Increase cache TTL
- Reduce batch sizes in `newsAggregator.ts`

### RSS feeds timing out

**Cause:** Some feeds may be slow or unavailable
**Solution:** System gracefully handles failures and continues with other sources

## Production Deployment

### Netlify

Add environment variables in Netlify dashboard:
1. Site Settings → Environment Variables
2. Add `OPENAI_API_KEY`
3. Optionally add `NEWS_API_KEY`

### Vercel

```bash
vercel env add OPENAI_API_KEY
vercel env add NEWS_API_KEY  # Optional
```

### Using Redis Cache (Recommended for Production)

Replace the in-memory cache with Redis:

```typescript
// lib/newsCache.ts
import Redis from 'ioredis';

export class NewsCache {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }

  async get(key: string): Promise<GeolocatedStory[] | null> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(data: GeolocatedStory[], key: string): Promise<void> {
    await this.redis.setex(key, 600, JSON.stringify(data)); // 10min TTL
  }
}
```

## Advanced: Background Cron Job

For production, set up a cron job to refresh news periodically:

### Netlify Scheduled Functions

Create `netlify/functions/scheduled-news-update.ts`:

```typescript
import { schedule } from '@netlify/functions';
import { NewsAggregator } from '../../lib/newsAggregator';

export const handler = schedule('*/10 * * * *', async () => {
  const aggregator = new NewsAggregator(
    process.env.OPENAI_API_KEY!,
    process.env.NEWS_API_KEY
  );

  await aggregator.refreshCache();

  return {
    statusCode: 200,
  };
});
```

### Vercel Cron Jobs

Add to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/update-news",
    "schedule": "*/10 * * * *"
  }]
}
```

Create `app/api/cron/update-news/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { NewsAggregator } from '@/lib/newsAggregator';

export async function GET() {
  const aggregator = new NewsAggregator(
    process.env.OPENAI_API_KEY!,
    process.env.NEWS_API_KEY
  );

  await aggregator.refreshCache();

  return NextResponse.json({ success: true });
}
```

## Monitoring

Add logging to track scraper performance:

```typescript
// lib/newsAggregator.ts
console.log(`Fetched ${stories.length} stories`);
console.log(`Cache hit rate: ${hitRate}%`);
console.log(`API costs: $${estimatedCost.toFixed(4)}`);
```

## Support & Resources

- [NewsAPI Documentation](https://newsapi.org/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [RSS Parser Library](https://github.com/rbren/rss-parser)
- [GPT-4o-mini Pricing](https://openai.com/pricing)

## License

This news scraping system is part of the News Globe project and subject to the same license.

---

**Questions or issues?** Open an issue on GitHub or check the main README.md file.
