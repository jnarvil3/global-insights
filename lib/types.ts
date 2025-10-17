export type NewsCategory = 'politics' | 'conflict' | 'environment' | 'tech' | 'health' | 'economy';
export type Urgency = 'breaking' | 'recent' | 'standard';

export interface RawStory {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
}

export interface EnrichedStory extends RawStory {
  location: string;
  summary: string;
  category: NewsCategory;
  urgency: Urgency;
}

export interface GeolocatedStory extends EnrichedStory {
  coords: {
    lat: number;
    lng: number;
  };
}

export interface StoryCluster {
  centroid: {
    lat: number;
    lng: number;
  };
  stories: GeolocatedStory[];
  intensity: number;
  topStory: GeolocatedStory;
}

export interface BeamColors {
  politics: string;
  conflict: string;
  environment: string;
  tech: string;
  health: string;
  economy: string;
}
