import { getSupabaseClient } from '../../config/supabase';
import { SearchResultSchema, SearchQuerySchema } from './searchSchemas';
import type { SearchResult, SearchQuery } from './searchSchemas';

export async function searchContent(rawQuery: SearchQuery): Promise<SearchResult[]> {
  const query = SearchQuerySchema.parse(rawQuery);
  const supabase = getSupabaseClient();
  const searchPattern = `%${query.query}%`;

  const tasks: Promise<SearchResult[]>[] = [];

  if (query.category === 'all' || query.category === 'content') {
    tasks.push(
      Promise.resolve(
        supabase
          .from('content_items')
          .select('id, title, description, content_type')
          .ilike('title', searchPattern)
          .limit(query.limit)
      ).then(({ data }) =>
        (data || []).map((item) =>
          SearchResultSchema.parse({
            id: `content-${item.id}`,
            type: 'content',
            title: item.title,
            subtitle: `${item.content_type} • Content`,
            icon: 'file',
          }),
        ),
      ),
    );
  }

  if (query.category === 'all' || query.category === 'challenges') {
    tasks.push(
      Promise.resolve(
        supabase
          .from('challenges')
          .select('id, title, description')
          .ilike('title', searchPattern)
          .limit(query.limit)
      ).then(({ data }) =>
        (data || []).map((item) =>
          SearchResultSchema.parse({
            id: `challenge-${item.id}`,
            type: 'challenge',
            title: item.title,
            subtitle: item.description ?? 'Challenge',
            icon: 'trophy',
          }),
        ),
      ),
    );
  }

  if (query.category === 'all' || query.category === 'sessions') {
    tasks.push(
      Promise.resolve(
        supabase
          .from('session_presets')
          .select('id, name, duration_minutes, difficulty')
          .ilike('name', searchPattern)
          .limit(query.limit)
      ).then(({ data }) =>
        (data || []).map((item) =>
          SearchResultSchema.parse({
            id: `session-${item.id}`,
            type: 'session',
            title: item.name,
            subtitle: `${item.duration_minutes} min • ${item.difficulty}`,
            icon: 'play',
          }),
        ),
      ),
    );
  }

  const combined = await Promise.all(tasks);
  return combined.flat().slice(0, query.limit);
}
