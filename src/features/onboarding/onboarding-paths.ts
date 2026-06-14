import { z } from 'zod';

export const OnboardingPathSchema = z.enum([
  'focus',
  'plan',
  'study',
  'habit',
]);

export type OnboardingPath = z.infer<typeof OnboardingPathSchema>;

export const PATH_METADATA: Record<
  OnboardingPath,
  {
    label: string;
    description: string;
    icon: string;
    accentColor: string;
    laneAffinity: string;
  }
> = {
  focus: {
    label: 'I want to focus now',
    description: 'Jump into a timed session and build momentum',
    icon: 'zap',
    accentColor: '#FF8A24',
    laneAffinity: 'minimal_normal',
  },
  plan: {
    label: 'I want to plan my week',
    description: 'Organize tasks, projects, and set intentions',
    icon: 'layout',
    accentColor: '#54AEEA',
    laneAffinity: 'deep_creative',
  },
  study: {
    label: 'I want to study something',
    description: 'Set up study topics and content to learn',
    icon: 'book-open',
    accentColor: '#18B894',
    laneAffinity: 'student',
  },
  habit: {
    label: 'I want to build a habit',
    description: 'Track daily routines and build consistency',
    icon: 'repeat',
    accentColor: '#8B5CF6',
    laneAffinity: 'game_like',
  },
};

export function getPathFromLane(lane: string): OnboardingPath {
  switch (lane) {
    case 'student':
      return 'study';
    case 'game_like':
      return 'habit';
    case 'deep_creative':
      return 'plan';
    default:
      return 'focus';
  }
}

export function getDefaultPath(): OnboardingPath {
  return 'focus';
}
