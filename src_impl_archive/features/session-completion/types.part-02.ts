import type { ShareableCustomization, ShareableTemplate } from './types';

export interface AchievementUnlock {
  id: string;
  achievementId: string;
  name: string;
  description: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  progress: AchievementProgress;
  unlockedAt: Date;
  firstTime: boolean;
  shareable: boolean;
}

export interface AchievementProgress {
  current: number;
  total: number;
  percentage: number;
  completed: boolean;
  nextMilestone?: MilestoneProgress;
}

export interface MilestoneProgress {
  milestone: number;
  required: number;
  current: number;
  percentage: number;
  reward?: string;
}

export interface ProgressUpdate {
  type: ProgressType;
  area: string;
  previous: number;
  current: number;
  change: number;
  percentage: number;
  significance: 'low' | 'medium' | 'high';
  context: string;
}

export type ProgressType = 'skill_level' | 'experience' | 'streak' | 'rank' | 'title' | 'unlock' | 'reputation' | 'currency' | 'achievement' | 'milestone';

export interface CompletionExperience {
  flow: FlowExperience;
  satisfaction: SatisfactionScore;
  engagement: EngagementMetrics;
  motivation: MotivationState;
  emotions: EmotionalState;
  feedback: UserFeedback;
}

export interface FlowExperience {
  achieved: boolean;
  duration: number; // in seconds
  intensity: number; // 0-100
  quality: number; // 0-100
  triggers: string[];
  barriers: string[];
  factors: FlowFactor[];
}

export interface FlowFactor {
  factor: string;
  impact: number; // -100 to 100
  description: string;
  category: 'positive' | 'negative' | 'neutral';
}

export interface SatisfactionScore {
  overall: number; // 0-100
  components: SatisfactionComponent[];
  trend: 'improving' | 'stable' | 'declining';
  drivers: SatisfactionDriver[];
}

export interface SatisfactionComponent {
  aspect: 'challenge' | 'skill' | 'control' | 'goals' | 'feedback' | 'immersion';
  score: number; // 0-100
  weight: number;
  importance: number;
}

export interface SatisfactionDriver {
  driver: string;
  impact: number; // -100 to 100
  description: string;
  actionable: boolean;
}

export interface EngagementMetrics {
  attention: number; // 0-100
  interest: number; // 0-100
  involvement: number; // 0-100
  enthusiasm: number; // 0-100
  focus: number; // 0-100
  persistence: number; // 0-100
  quality: number; // 0-100
}

export interface MotivationState {
  intrinsic: number; // 0-100
  extrinsic: number; // 0-100
  competence: number; // 0-100
  autonomy: number; // 0-100
  relatedness: number; // 0-100
  mastery: number; // 0-100
  purpose: number; // 0-100
}

export interface EmotionalState {
  primary: Emotion;
  secondary?: Emotion;
  intensity: number; // 0-100
  valence: number; // -100 to 100 (negative to positive)
  arousal: number; // 0-100 (calm to excited)
  stability: number; // 0-100
}

export interface Emotion {
  type: EmotionType;
  confidence: number; // 0-100
  triggers: string[];
  duration: number; // in seconds
}

export type EmotionType = 'joy' | 'excitement' | 'pride' | 'satisfaction' | 'relief' | 'frustration' | 'anger' | 'disappointment' | 'anxiety' | 'boredom' | 'confusion' | 'surprise';

export interface UserFeedback {
  rating: number; // 1-5
  difficulty: number; // 1-5
  enjoyment: number; // 1-5
  comments?: string;
  suggestions?: string[];
  bugs?: string[];
  wouldRecommend: boolean;
  wouldPlayAgain: boolean;
}

export interface ShareableContent {
  type: ShareableType;
  title: string;
  description: string;
  image?: string;
  data: ShareableData;
  platforms: SocialPlatform[];
  template: ShareableTemplate;
  customizations: ShareableCustomization[];
}

export type ShareableType = 'achievement' | 'performance' | 'milestone' | 'streak' | 'rank_up' | 'unlock' | 'completion' | 'story';

export interface ShareableData {
  score: number;
  rank: number;
  achievement?: string;
  milestone?: string;
  streak?: number;
  time?: string;
  difficulty?: string;
  highlights: string[];
}

export type SocialPlatform = 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'reddit' | 'discord' | 'slack' | 'whatsapp' | 'telegram';

