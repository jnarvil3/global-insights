import { NextRequest, NextResponse } from 'next/server';
import { NewsAggregator } from '@/lib/newsAggregator';
import type { GeolocatedStory } from '@/lib/types';

// Mock news data for demo fallback (when no API keys provided)
const mockNews: GeolocatedStory[] = [
  {
    title: 'Climate Summit Reaches Historic Agreement',
    description: 'World leaders agree on new emissions targets at COP conference',
    url: 'https://example.com/climate',
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    source: 'Global News',
    location: 'Paris, France',
    summary: 'Historic climate agreement reached with 195 countries committing to ambitious emission reduction targets.',
    category: 'environment',
    urgency: 'breaking',
    coords: { lat: 48.8566, lng: 2.3522 },
  },
  {
    title: 'Tech Giants Announce AI Partnership',
    description: 'Major technology companies form alliance for ethical AI development',
    url: 'https://example.com/tech',
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    source: 'Tech Today',
    location: 'San Francisco, USA',
    summary: 'Leading tech companies collaborate on establishing ethical guidelines and safety standards for AI.',
    category: 'tech',
    urgency: 'recent',
    coords: { lat: 37.7749, lng: -122.4194 },
  },
  {
    title: 'Breakthrough in Renewable Energy Storage',
    description: 'New battery technology promises to revolutionize clean energy',
    url: 'https://example.com/energy',
    publishedAt: new Date(Date.now() - 10800000).toISOString(),
    source: 'Science Daily',
    location: 'Tokyo, Japan',
    summary: 'Scientists develop revolutionary battery technology enabling efficient large-scale renewable energy storage.',
    category: 'tech',
    urgency: 'recent',
    coords: { lat: 35.6762, lng: 139.6503 },
  },
  {
    title: 'Global Markets Rally on Economic Data',
    description: 'Stock markets surge following positive employment reports',
    url: 'https://example.com/markets',
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
    source: 'Financial Times',
    location: 'London, UK',
    summary: 'International markets experience significant gains as economic indicators exceed expectations.',
    category: 'economy',
    urgency: 'standard',
    coords: { lat: 51.5074, lng: -0.1278 },
  },
  {
    title: 'Peace Talks Begin in Regional Conflict',
    description: 'Diplomatic efforts intensify to resolve long-standing tensions',
    url: 'https://example.com/peace',
    publishedAt: new Date(Date.now() - 18000000).toISOString(),
    source: 'World News',
    location: 'Geneva, Switzerland',
    summary: 'International mediators facilitate historic peace negotiations aimed at ending regional conflict.',
    category: 'politics',
    urgency: 'recent',
    coords: { lat: 46.2044, lng: 6.1432 },
  },
  {
    title: 'Medical Breakthrough in Cancer Treatment',
    description: 'New immunotherapy shows promising results in clinical trials',
    url: 'https://example.com/medical',
    publishedAt: new Date(Date.now() - 21600000).toISOString(),
    source: 'Health News',
    location: 'Boston, USA',
    summary: 'Groundbreaking cancer treatment demonstrates remarkable success rates in advanced clinical trials.',
    category: 'health',
    urgency: 'recent',
    coords: { lat: 42.3601, lng: -71.0589 },
  },
  {
    title: 'Space Agency Announces Mars Mission',
    description: 'Ambitious plan to send human crew to Mars by 2035',
    url: 'https://example.com/space',
    publishedAt: new Date(Date.now() - 25200000).toISOString(),
    source: 'Space News',
    location: 'Houston, USA',
    summary: 'Space agency reveals detailed timeline for first crewed mission to Mars with international collaboration.',
    category: 'tech',
    urgency: 'standard',
    coords: { lat: 29.7604, lng: -95.3698 },
  },
  {
    title: 'G20 Summit Addresses Global Trade',
    description: 'Economic leaders discuss international trade policies',
    url: 'https://example.com/g20',
    publishedAt: new Date(Date.now() - 28800000).toISOString(),
    source: 'Economic Times',
    location: 'Singapore',
    summary: 'G20 nations commit to strengthening multilateral trade agreements and reducing trade barriers.',
    category: 'economy',
    urgency: 'standard',
    coords: { lat: 1.3521, lng: 103.8198 },
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get('refresh') === 'true';
    const stream = searchParams.get('stream') === 'true';

    // Check for API keys in environment variables
    const openaiKey = process.env.OPENAI_API_KEY;
    const newsAPIKey = process.env.NEWS_API_KEY;

    // If no OpenAI key, fall back to mock data
    if (!openaiKey) {
      console.warn('No OPENAI_API_KEY found, using mock data');

      // Stream mock data if requested
      if (stream) {
        const encoder = new TextEncoder();
        const readable = new ReadableStream({
          async start(controller) {
            // Send stories one at a time with delays to simulate progressive loading
            for (const story of mockNews) {
              controller.enqueue(
                encoder.encode(JSON.stringify({ type: 'story', data: story }) + '\n')
              );
              await new Promise(resolve => setTimeout(resolve, 100));
            }
            controller.enqueue(
              encoder.encode(JSON.stringify({
                type: 'complete',
                data: {
                  count: mockNews.length,
                  lastUpdated: new Date().toISOString(),
                  mode: 'mock'
                }
              }) + '\n')
            );
            controller.close();
          },
        });

        return new Response(readable, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      return NextResponse.json({
        success: true,
        stories: mockNews,
        count: mockNews.length,
        lastUpdated: new Date().toISOString(),
        mode: 'mock',
      });
    }

    // Use real news aggregator
    const aggregator = new NewsAggregator(openaiKey, newsAPIKey);

    // Stream stories if requested
    if (stream) {
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            await aggregator.aggregateNewsStreaming(!refresh, (story) => {
              controller.enqueue(
                encoder.encode(JSON.stringify({ type: 'story', data: story }) + '\n')
              );
            });

            controller.enqueue(
              encoder.encode(JSON.stringify({
                type: 'complete',
                data: {
                  lastUpdated: new Date().toISOString(),
                  mode: 'live'
                }
              }) + '\n')
            );
            controller.close();
          } catch (error) {
            controller.enqueue(
              encoder.encode(JSON.stringify({
                type: 'error',
                data: { message: error instanceof Error ? error.message : 'Unknown error' }
              }) + '\n')
            );
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Non-streaming fallback
    const stories = await aggregator.aggregateNews(!refresh);

    return NextResponse.json({
      success: true,
      stories,
      count: stories.length,
      lastUpdated: new Date().toISOString(),
      mode: 'live',
    });
  } catch (error) {
    console.error('Error fetching news:', error);

    // Fall back to mock data on error
    return NextResponse.json({
      success: true,
      stories: mockNews,
      count: mockNews.length,
      lastUpdated: new Date().toISOString(),
      mode: 'mock-fallback',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
