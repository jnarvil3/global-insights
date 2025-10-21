import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { RawStory, EnrichedStory } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { stories, apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API key required' },
        { status: 400 }
      );
    }

    if (!stories || !Array.isArray(stories) || stories.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Stories array required' },
        { status: 400 }
      );
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const prompt = `
You are a news cartographer analyzing global news stories. For each story provided, extract:
1. Primary location (city and country, be specific)
2. A 25-word summary focusing on the key facts
3. Category: one of [politics, conflict, environment, tech, health, economy]
4. Urgency: one of [breaking, recent, standard] based on timestamp

Return a JSON array with this exact structure for each story:
{
  "location": "City, Country",
  "summary": "25-word summary here",
  "category": "category_name",
  "urgency": "urgency_level"
}

Stories to analyze:
${JSON.stringify(stories.slice(0, 10))}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a news analysis assistant. Always respond with valid JSON.',
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
      response.choices[0].message.content || '{}'
    );

    // Merge enriched data with original stories
    const enrichedStories: EnrichedStory[] = stories.map(
      (story: RawStory, index: number) => ({
        ...story,
        location: enrichedData.results?.[index]?.location || 'Unknown',
        summary:
          enrichedData.results?.[index]?.summary || story.description,
        category: enrichedData.results?.[index]?.category || 'politics',
        urgency: enrichedData.results?.[index]?.urgency || 'standard',
      })
    );

    return NextResponse.json({
      success: true,
      enrichedStories,
      count: enrichedStories.length,
    });
  } catch (error: any) {
    console.error('Error enriching stories:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to enrich stories',
      },
      { status: 500 }
    );
  }
}
