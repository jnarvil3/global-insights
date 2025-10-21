import Parser from 'rss-parser';
import type { RawStory } from './types';

interface NewsAPIArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

interface RSSItem {
  title?: string;
  contentSnippet?: string;
  link?: string;
  pubDate?: string;
  creator?: string;
}

export class NewsScraperService {
  private rssParser: Parser;
  private newsAPIKey?: string;

  // Diverse global RSS feeds
  private readonly RSS_FEEDS = [
    'https://feeds.bbci.co.uk/news/world/rss.xml', // BBC World
    'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', // NYT World
    'https://www.aljazeera.com/xml/rss/all.xml', // Al Jazeera
    'https://www.theguardian.com/world/rss', // Guardian World
    'https://www.reuters.com/rssFeed/worldNews', // Reuters World
    'https://feeds.washingtonpost.com/rss/world', // Washington Post
    'https://www.ft.com/rss/world', // Financial Times
    'https://www.scmp.com/rss/91/feed', // South China Morning Post
    'https://www.thehindu.com/news/international/feeder/default.rss', // The Hindu
    'https://www.smh.com.au/rss/world.xml', // Sydney Morning Herald
  ];

  constructor(newsAPIKey?: string) {
    this.rssParser = new Parser({
      timeout: 10000,
      headers: {
        'User-Agent': 'NewsGlobe/1.0',
      },
    });
    this.newsAPIKey = newsAPIKey;
  }

  /**
   * Fetch news from NewsAPI (if API key provided)
   */
  private async fetchFromNewsAPI(): Promise<RawStory[]> {
    if (!this.newsAPIKey) {
      return [];
    }

    try {
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?` +
        `category=general&` +
        `pageSize=50&` +
        `apiKey=${this.newsAPIKey}`,
        { next: { revalidate: 600 } } // Cache for 10 minutes
      );

      if (!response.ok) {
        console.error('NewsAPI error:', response.statusText);
        return [];
      }

      const data = await response.json();

      return (data.articles || [])
        .filter((article: NewsAPIArticle) =>
          article.title &&
          article.description &&
          article.url &&
          !article.title.includes('[Removed]')
        )
        .map((article: NewsAPIArticle) => ({
          title: article.title,
          description: article.description,
          url: article.url,
          publishedAt: article.publishedAt,
          source: article.source.name,
        }));
    } catch (error) {
      console.error('Error fetching from NewsAPI:', error);
      return [];
    }
  }

  /**
   * Fetch news from a single RSS feed
   */
  private async fetchFromRSSFeed(feedUrl: string): Promise<RawStory[]> {
    try {
      const feed = await this.rssParser.parseURL(feedUrl);

      return (feed.items || [])
        .filter((item: RSSItem) => item.title && item.link)
        .map((item: RSSItem) => ({
          title: item.title || 'Untitled',
          description: item.contentSnippet || item.title || '',
          url: item.link || '',
          publishedAt: item.pubDate || new Date().toISOString(),
          source: feed.title || 'RSS Feed',
        }))
        .slice(0, 10); // Limit per feed
    } catch (error) {
      console.error(`Error fetching RSS feed ${feedUrl}:`, error);
      return [];
    }
  }

  /**
   * Fetch news from all RSS feeds in parallel
   */
  private async fetchFromAllRSSFeeds(): Promise<RawStory[]> {
    const feedPromises = this.RSS_FEEDS.map(feedUrl =>
      this.fetchFromRSSFeed(feedUrl)
    );

    const results = await Promise.allSettled(feedPromises);

    return results
      .filter((result): result is PromiseFulfilledResult<RawStory[]> =>
        result.status === 'fulfilled'
      )
      .flatMap(result => result.value);
  }

  /**
   * Deduplicate stories based on title similarity
   */
  private deduplicateStories(stories: RawStory[]): RawStory[] {
    const uniqueStories = new Map<string, RawStory>();

    for (const story of stories) {
      // Create a normalized key from title
      const key = story.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .trim()
        .substring(0, 50);

      if (!uniqueStories.has(key)) {
        uniqueStories.set(key, story);
      }
    }

    return Array.from(uniqueStories.values());
  }

  /**
   * Sort stories by publish date (newest first)
   */
  private sortByDate(stories: RawStory[]): RawStory[] {
    return stories.sort((a, b) => {
      const dateA = new Date(a.publishedAt).getTime();
      const dateB = new Date(b.publishedAt).getTime();
      return dateB - dateA;
    });
  }

  /**
   * Main method to fetch all news stories
   */
  async fetchNews(): Promise<RawStory[]> {
    console.log('Starting news fetch...');

    // Fetch from both sources in parallel
    const [newsAPIStories, rssStories] = await Promise.all([
      this.fetchFromNewsAPI(),
      this.fetchFromAllRSSFeeds(),
    ]);

    console.log(`Fetched ${newsAPIStories.length} from NewsAPI`);
    console.log(`Fetched ${rssStories.length} from RSS feeds`);

    // Combine all stories
    const allStories = [...newsAPIStories, ...rssStories];

    // Deduplicate and sort
    const uniqueStories = this.deduplicateStories(allStories);
    const sortedStories = this.sortByDate(uniqueStories);

    console.log(`Final count: ${sortedStories.length} unique stories`);

    // Return top 100 stories
    return sortedStories.slice(0, 100);
  }

  /**
   * Fetch news for specific countries
   */
  async fetchNewsByCountries(countryCodes: string[]): Promise<RawStory[]> {
    if (!this.newsAPIKey) {
      console.warn('No NewsAPI key provided, skipping country-specific fetch');
      return [];
    }

    const promises = countryCodes.map(async (country) => {
      try {
        const response = await fetch(
          `https://newsapi.org/v2/top-headlines?` +
          `country=${country}&` +
          `pageSize=10&` +
          `apiKey=${this.newsAPIKey}`,
          { next: { revalidate: 600 } }
        );

        if (!response.ok) return [];

        const data = await response.json();
        return (data.articles || [])
          .filter((article: NewsAPIArticle) =>
            article.title && article.description && article.url
          )
          .map((article: NewsAPIArticle) => ({
            title: article.title,
            description: article.description,
            url: article.url,
            publishedAt: article.publishedAt,
            source: article.source.name,
          }));
      } catch (error) {
        console.error(`Error fetching news for ${country}:`, error);
        return [];
      }
    });

    const results = await Promise.allSettled(promises);
    const stories = results
      .filter((result): result is PromiseFulfilledResult<RawStory[]> =>
        result.status === 'fulfilled'
      )
      .flatMap(result => result.value);

    return this.deduplicateStories(stories);
  }
}
