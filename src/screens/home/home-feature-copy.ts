import type { FeatureKey } from '../../features/liveops-config';

export const HOME_FEATURE_COPY: Record<
  FeatureKey,
  { icon: string; title: string; why: string }
> = {
  achievements: {
    icon: '*',
    title: 'Achievements',
    why: 'Milestones show behavior change, not grind.',
  },
  advanced_settings: {
    icon: 'gear',
    title: 'Settings',
    why: 'Fine-tune your VEX experience.',
  },
  ai_coach_advanced: {
    icon: 'coach',
    title: 'Advanced Coach',
    why: 'Deeper coaching uses real behavior evidence.',
  },
  ai_coach_basic: {
    icon: 'coach',
    title: 'Coach',
    why: 'Your coach becomes personal once it sees real behavior.',
  },
  battle_pass: {
    icon: 'run',
    title: 'Weekly Run',
    why: 'Weekly structure appears only when it helps your lane.',
  },
  boss_bounties: {
    icon: 'mod',
    title: 'Focus Modifier',
    why: 'Optional constraints make one session clearer.',
  },
  boss_tab: {
    icon: 'blocker',
    title: 'Personal Blocker',
    why: 'Game-like focus can frame blockers without fake rewards.',
  },
  challenges: {
    icon: 'test',
    title: 'Experiments',
    why: 'Small behavior experiments help VEX learn what works.',
  },
  companion_detail: {
    icon: 'presence',
    title: 'Companion',
    why: 'A quiet lane-aware presence reflects what VEX has learned.',
  },
  content_study: {
    icon: 'study',
    title: 'Study',
    why: 'Study OS turns material into useful focus blocks.',
  },
  content_study_advanced: {
    icon: 'review',
    title: 'Advanced Study',
    why: 'Deeper study tools help with deadlines, review, and weak topics.',
  },
  economy_advanced: {
    icon: 'insight',
    title: 'Progress Intelligence',
    why: 'Deeper insight appears only after real session evidence.',
  },
  economy_basic: {
    icon: 'proof',
    title: 'Progress',
    why: 'Simple proof keeps each finish useful.',
  },
  focus_session: {
    icon: 'focus',
    title: 'Focus',
    why: 'The core focus loop keeps getting smoother as you build consistency.',
  },
  focus_tab: {
    icon: 'focus',
    title: 'Focus',
    why: 'The heart of your focus practice.',
  },
  gems_prominent: {
    icon: 'pro',
    title: 'Premium Insight',
    why: 'Premium adds durable intelligence, not currency.',
  },
  home_tab: {
    icon: 'home',
    title: 'Home',
    why: 'Your home base for focus and progress.',
  },
  inventory: {
    icon: 'save',
    title: 'Saved Strategies',
    why: 'Reusable strategies stay tied to behavior, not items.',
  },
  memory_console: {
    icon: 'brain',
    title: 'Memory Console',
    why: 'Inspect, edit, and delete what VEX remembers about your focus patterns.',
  },
  premium_paywall: {
    icon: 'pro',
    title: 'Premium',
    why: 'Deep memory, Progress Intelligence, and advanced planning unlock after proven value.',
  },
  profile_tab: {
    icon: 'profile',
    title: 'Profile',
    why: 'Your personal hub for stats and settings.',
  },
  progress_view: {
    icon: 'progress',
    title: 'Progress',
    why: 'Progress turns each session into visible momentum.',
  },
  quiz_review_mode: {
    icon: 'quiz',
    title: 'Quiz Mode',
    why: 'Test your knowledge and reinforce learning.',
  },
  rankings: {
    icon: 'proof',
    title: 'Progress Proof',
    why: 'Private progress matters before comparison.',
  },
  rivals: {
    icon: 'accountability',
    title: 'Accountability',
    why: 'Optional accountability supports focus without public pressure.',
  },
  seasonal_features: {
    icon: 'week',
    title: 'Weekly',
    why: 'Weekly moments work best once VEX already feels useful.',
  },
  shop: {
    icon: 'strategy',
    title: 'Strategy Library',
    why: 'Reusable strategies replace purchasable boosts.',
  },
  social_tab: {
    icon: 'pod',
    title: 'Accountability',
    why: 'Small private accountability can help after opt-in.',
  },
  squads: {
    icon: 'pod',
    title: 'Focus Pod',
    why: 'Small pods make showing up feel shared, not public.',
  },
  streak_insurance: {
    icon: 'recovery',
    title: 'Recovery Plan',
    why: 'Recovery uses honest next actions, not paid saves.',
  },
  wagers: {
    icon: 'commit',
    title: 'Commitment Plan',
    why: 'Commitment stays ethical and never uses betting.',
  },
};
