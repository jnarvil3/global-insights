import { NextRequest, NextResponse } from 'next/server';
import type { GeolocatedStory } from '@/lib/types';

// Mock news data for demo (in production, fetch from NewsAPI or RSS)
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
    // In production, this would:
    // 1. Fetch from NewsAPI or RSS feeds
    // 2. Cache in Redis with 10min TTL
    // 3. Return aggregated and deduplicated stories

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      stories: mockNews,
      count: mockNews.length,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
