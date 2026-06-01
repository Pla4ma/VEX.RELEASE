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

export const MOCK_RESULTS = [
  {
    id: '1',
    type: 'session' as const,
    title: 'Morning Meditation',
    subtitle: '10 min • Beginner',
    icon: 'play' as const,
  },
  {
    id: '2',
    type: 'challenge' as const,
    title: '7-Day Mindfulness',
    subtitle: 'Challenge • 1.2k participants',
    icon: 'trophy' as const,
  },
  {
    id: '3',
    type: 'user' as const,
    title: 'Sarah Johnson',
    subtitle: 'Level 24 • 45 day streak',
    icon: 'user' as const,
  },
  {
    id: '4',
    type: 'content' as const,
    title: 'Focus Techniques Guide',
    subtitle: 'Article • 5 min read',
    icon: 'file' as const,
  },
];

export type SearchResult = (typeof MOCK_RESULTS)[number];
