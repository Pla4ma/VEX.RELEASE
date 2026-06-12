import { z } from 'zod';

export const SearchResultSchema = z.object({
  id: z.string(),
  type: z.enum(['session', 'challenge', 'content', 'user']),
  title: z.string(),
  subtitle: z.string(),
  icon: z.string(),
});

export type SearchResult = z.infer<typeof SearchResultSchema>;

export const SearchQuerySchema = z.object({
  query: z.string().min(1),
  category: z.string().default('all'),
  limit: z.number().default(20),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;
