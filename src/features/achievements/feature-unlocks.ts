export interface FeatureUnlock {
  achievementId: string;
  featureType: 'COSMETIC' | 'BOSS' | 'STUDY' | 'SOCIAL' | 'PREMIUM';
  featureId: string;
  featureName: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENT_FEATURE_UNLOCKS: FeatureUnlock[] = [
  {
    achievementId: 'achievement-7-day-streak',
    featureType: 'COSMETIC',
    featureId: 'streak-flame-avatar-frame',
    featureName: 'Flame Frame',
    description: 'Animated fire border for your avatar',
    icon: '🔥',
  },
  {
    achievementId: 'achievement-14-day-streak',
    featureType: 'COSMETIC',
    featureId: 'fortnight-animated-frame',
    featureName: 'Fortnight Aura',
    description: 'Pulsing golden aura around avatar',
    icon: '🎆',
  },
  {
    achievementId: 'achievement-30-day-streak',
    featureType: 'COSMETIC',
    featureId: 'monthly-master-crown',
    featureName: 'Master Crown',
    description: 'Royal crown with particle effects',
    icon: '👑',
  },
  {
    achievementId: 'achievement-100-day-streak',
    featureType: 'COSMETIC',
    featureId: 'century-legendary-aura',
    featureName: 'Legendary Aura',
    description: 'Exclusive rainbow aura (rarest cosmetic)',
    icon: '🏆',
  },
  {
    achievementId: 'achievement-topics-conquered-10',
    featureType: 'COSMETIC',
    featureId: 'scholar-aura',
    featureName: 'Scholar Aura',
    description: 'Academic brilliance visual effect',
    icon: '🎓',
  },
  {
    achievementId: 'achievement-perfect-s-week',
    featureType: 'COSMETIC',
    featureId: 'diamond-aura',
    featureName: 'Diamond Aura',
    description: 'Flawless performance crystal effect',
    icon: '💎',
  },
  {
    achievementId: 'achievement-100-day-streak',
    featureType: 'BOSS',
    featureId: 'century-dragon-boss',
    featureName: 'Century Dragon',
    description: 'Exclusive boss only for 100-day streak holders',
    icon: '🐉',
  },
  {
    achievementId: 'achievement-all-bosses',
    featureType: 'BOSS',
    featureId: 'ultimate-boss-skin',
    featureName: 'Ultimate Hunter Skin',
    description: 'Legendary boss reskin with unique animations',
    icon: '👹',
  },
  {
    achievementId: 'achievement-topics-conquered-10',
    featureType: 'STUDY',
    featureId: 'advanced-ai-study',
    featureName: 'Advanced AI Study',
    description: 'Unlock enhanced AI study plan generation',
    icon: '🤖',
  },
  {
    achievementId: 'achievement-perfect-plan',
    featureType: 'STUDY',
    featureId: 'study-plan-templates',
    featureName: 'Plan Templates',
    description: 'Access premium study plan templates',
    icon: '📋',
  },
  {
    achievementId: 'achievement-squad-mvp',
    featureType: 'SOCIAL',
    featureId: 'mvp-title',
    featureName: 'MVP Title',
    description: 'Exclusive MVP badge visible to squad members',
    icon: '🌟',
  },
];
