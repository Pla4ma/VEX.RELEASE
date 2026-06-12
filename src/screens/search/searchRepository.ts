import { getSupabaseClient } from '../../config/supabase';
import { SearchResultSchema, SearchQuerySchema } from './searchSchemas';
import type { SearchResult, SearchQuery } from './searchSchemas';

export async function searchContent(rawQuery: SearchQuery): Promise<SearchResult[]> {
  const query = SearchQuerySchema.parse(rawQuery);
  const supabase = getSupabaseClient();
  const searchPattern = `%${query.query}%`;
  const results: SearchResult[] = [];

  if (query.category === 'all' || query.category === 'content') {
    const { data: contentData } = await supabase
      .from('content_items')
      .select('id, title, description, content_type')
      .ilike('title', searchPattern)
      .limit(query.limit);

    if (contentData) {
      for (const item of contentData) {
        results.push(
          SearchResultSchema.parse({
            id: `content-${item.id}`,
            type: 'content',
            title: item.title,
            subtitle: `${item.content_type} • Content`,
            icon: 'file',
          }),
        );
      }
    }
  }

  if (query.category === 'all' || query.category === 'challenges') {
    const { data: challengeData } = await supabase
      .from('challenges')
      .select('id, title, description')
      .ilike('title', searchPattern)
      .limit(query.limit);

    if (challengeData) {
      for (const item of challengeData) {
        results.push(
          SearchResultSchema.parse({
            id: `challenge-${item.id}`,
            type: 'challenge',
            title: item.title,
            subtitle: item.description ?? 'Challenge',
            icon: 'trophy',
          }),
        );
      }
    }
  }

  if (query.category === 'all' || query.category === 'sessions') {
    const { data: sessionData } = await supabase
      .from('session_presets')
      .select('id, name, duration_minutes, difficulty')
      .ilike('name', searchPattern)
      .limit(query.limit);

    if (sessionData) {
      for (const item of sessionData) {
        results.push(
          SearchResultSchema.parse({
            id: `session-${item.id}`,
            type: 'session',
            title: item.name,
            subtitle: `${item.duration_minutes} min • ${item.difficulty}`,
            icon: 'play',
          }),
        );
      }
    }
  }

  return results.slice(0, query.limit);
}
