import { eventBus } from "../../events";
import { awardInsurance } from "../streaks/StreakEvolutionSystem";
import type { Achievement, AchievementCategory, AchievementRarity } from "./types";


export const STREAK_EVOLUTION_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'achievement-insurance-saver',
    title: 'Smart Saver',
    description: 'Use streak insurance to protect your streak',
    category: 'STREAK' as AchievementCategory,
    rarity: 'UNCOMMON' as AchievementRarity,
    icon: '🛡️',
    isHidden: false,
    progressMax: 1,
    unlockCondition: {
      type: 'INSURANCE_USE',
      target: 1,
      comparator: 'GREATER_THAN',
    },
    reward: { coins: 200, xp: 400, badge: 'Smart Saver' },
    pointValue: 20,
    shareText: 'Streak protected by insurance! Smart Saver 🛡️',
    unlockRate: 0.35,
  },
  {
    id: 'achievement-comeback-champion',
    title: 'Comeback Champion',
    description: 'Complete a streak recovery plan',
    category: 'STREAK' as AchievementCategory,
    rarity: 'RARE' as AchievementRarity,
    icon: '🔄',
    isHidden: false,
    progressMax: 1,
    unlockCondition: {
      type: 'STREAK_RECOVERY_COMPLETE',
      target: 1,
      comparator: 'GREATER_THAN',
    },
    reward: { coins: 500, xp: 1000, badge: 'Comeback Champion' },
    pointValue: 40,
    shareText: 'Streak recovered! Comeback Champion 🔄',
    unlockRate: 0.2,
  },
  {
    id: 'achievement-protected-streak',
    title: 'Untouchable',
    description: 'Maintain a Protected streak for 3 days',
    category: 'STREAK' as AchievementCategory,
    rarity: 'UNCOMMON' as AchievementRarity,
    icon: '🌟',
    isHidden: false,
    progressMax: 3,
    unlockCondition: {
      type: 'PROTECTED_STREAK_MAINTAIN',
      target: 3,
      comparator: 'GREATER_THAN',
    },
    reward: { coins: 300, xp: 600, badge: 'Untouchable' },
    pointValue: 25,
    shareText: '3 days with protected streak! Untouchable 🌟',
    unlockRate: 0.15,
  },
];

export const ACHIEVEMENT_FEATURE_UNLOCKS: FeatureUnlock[] = [
  // Cosmetic unlocks
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

  // Boss unlocks
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

  // Study unlocks
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

  // Social unlocks
  {
    achievementId: 'achievement-squad-mvp',
    featureType: 'SOCIAL',
    featureId: 'mvp-title',
    featureName: 'MVP Title',
    description: 'Exclusive MVP badge visible to squad members',
    icon: '🌟',
  },
];