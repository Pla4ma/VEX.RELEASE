import { z } from 'zod';

export const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'grid' },
  { id: 'sessions', label: 'Sessions', icon: 'play' },
  { id: 'challenges', label: 'Challenges', icon: 'trophy' },
  { id: 'users', label: 'Users', icon: 'users' },
  { id: 'content', label: 'Content', icon: 'file' },
] as const;

export type SearchCategory = (typeof CATEGORIES)[number];

export const RECENT_SEARCHES = [
  'meditation basics',
  'morning routine',
  'focus techniques',
  'breathing exercises',
] as const;

