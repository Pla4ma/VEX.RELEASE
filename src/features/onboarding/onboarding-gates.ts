
import { lightColors } from '@/theme/tokens/colors';
import type {
  FeatureUnlockGate,
  OnboardingStep,
  StepContent,
} from './onboarding-types';

export const STEP_ORDER: OnboardingStep[] = [
  'WELCOME',
  'QUICK_START',
  'FIRST_SESSION',
  'POST_SESSION',
  'HOME_INTRO',
  'FEATURE_UNLOCK',
  'COMPLETE',
];

/**
 * Lane-specific feature unlock gates — no game economy references.
 * Study, Run, Project, and Clean unlock progressively as sessions accumulate.
 * "What VEX Learned" (memory) unlocks after session 3.
 */
export const FEATURE_UNLOCK_GATES: FeatureUnlockGate[] = [
  {
    featureId: 'clean_today_strip',
    featureName: 'Today Strip',
    description: "See today's planned sessions at a glance",
    requiresSessions: 2,
    icon: '📋',
    color: lightColors.semantic.success,
  },
  {
    featureId: 'study_intelligence',
    featureName: 'Study Intelligence',
    description: 'Review, recall, and study plan support',
    requiresSessions: 3,
    icon: '📚',
    color: lightColors.accent.blue,
  },
  {
    featureId: 'what_vex_learned',
    featureName: 'What VEX Learned',
    description: 'VEX remembers your patterns — edit or hide anything',
    requiresSessions: 3,
    icon: '🧠',
    color: lightColors.accent.purple,
  },
  {
    featureId: 'focus_run',
    featureName: 'Focus Run',
    description: 'Run-style sessions with personal blockers',
    requiresSessions: 4,
    icon: '🏃',
    color: lightColors.semantic.danger,
  },
  {
    featureId: 'project_thread',
    featureName: 'Project Thread',
    description: 'Resume project context and next moves',
    requiresSessions: 5,
    icon: '🧵',
    color: lightColors.accent.teal,
  },
  {
    featureId: 'coach_evolution',
    featureName: 'Coach Evolution',
    description: 'Coach adapts tone and timing to your rhythm',
    requiresSessions: 8,
    icon: '🤖',
    color: lightColors.accent.orange,
  },
];

export const STEP_CONTENT: Record<OnboardingStep, StepContent> = {
  WELCOME: {
    step: 'WELCOME',
    title: 'Welcome to VEX',
    subtitle: 'The productivity app that changes based on how you work',
    primaryAction: "Let's Get Started",
    secondaryAction: 'Skip Tutorial',
    showSkip: true,
    content:
      'VEX learns your rhythm, then unlocks the right system — Study, Run, Project, or Clean. Start with one focused session.',
  },
  QUICK_START: {
    step: 'QUICK_START',
    title: 'Match Your Style',
    subtitle: 'How would you like VEX to adapt?',
    primaryAction: 'Start 15-min Session',
    secondaryAction: 'Customize First',
    showSkip: false,
    content:
      'You can jump right into a 15-minute focus session, or answer a few questions so VEX can match your lane. What feels right?',
  },
  FIRST_SESSION: {
    step: 'FIRST_SESSION',
    title: 'Your First Session',
    subtitle: '15 minutes of focused work',
    primaryAction: 'Start Focusing',
    showSkip: false,
    content:
      'Pick one task to focus on. VEX will guide you through 15 minutes of distraction-free work. You got this.',
  },
  POST_SESSION: {
    step: 'POST_SESSION',
    title: 'First Session Done',
    subtitle: 'VEX is learning your rhythm',
    primaryAction: 'See Next Move',
    secondaryAction: 'Explore Home',
    showSkip: true,
    content:
      'One session down. VEX observed how you worked and will get smarter with each one. Want to see your next move or explore Home?',
  },
  HOME_INTRO: {
    step: 'HOME_INTRO',
    title: 'Your Home',
    subtitle: 'The right next session, every time',
    primaryAction: 'Got It',
    showSkip: false,
    content:
      'Home shows your lane and the right next session. No dashboard clutter — just what helps you start.',
  },
  FEATURE_UNLOCK: {
    step: 'FEATURE_UNLOCK',
    title: 'Something New Unlocked',
    subtitle: 'VEX adapts as you go',
    primaryAction: 'Try It Out',
    secondaryAction: 'Later',
    showSkip: true,
    content:
      'New systems unlock as VEX learns your rhythm. Keep going to discover more.',
  },
  COMPLETE: {
    step: 'COMPLETE',
    title: "You're All Set",
    subtitle: 'VEX will keep adapting',
    primaryAction: 'Start Focusing',
    showSkip: false,
    content:
      'VEX now has enough signal to recommend the right session and adapt over time. Start your next one whenever you are ready.',
  },
};
