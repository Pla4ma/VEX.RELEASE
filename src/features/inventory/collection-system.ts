/**
 * Collection Completion System
 * Sets of items that grant bonuses when complete
 * Gotta-catch-em-all psychology drives engagement
 */

import { eventBus } from '../../events';
import * as Sentry from '@sentry/react-native';
import { z } from 'zod';

// ============================================================================
// Schemas
// ============================================================================

export const CollectionItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  rarity: z.enum(['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY']),
  icon: z.string(),
  acquired: z.boolean().default(false),
  acquiredAt: z.number().nullable(),
  source: z.enum(['CHEST', 'SHOP', 'BOSS_DROP', 'ACHIEVEMENT', 'EVENT', 'BATTLE_PASS']),
});

export const CollectionSetSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  theme: z.string(),
  items: z.array(CollectionItemSchema),
  completionBonus: z.object({
    type: z.enum(['XP_BOOST', 'GEM_BONUS', 'STREAK_SHIELD', 'EXCLUSIVE_COSMETIC', 'TITLE']),
    amount: z.number(),
    description: z.string(),
  }),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXTREME']),
  hidden: z.boolean().default(false), // Secret collections
});

export const UserCollectionSchema = z.object({
  userId: z.string().uuid(),
  setId: z.string(),
  itemsAcquired: z.array(z.string()), // Item IDs
  completed: z.boolean().default(false),
  completedAt: z.number().nullable(),
  progress: z.number().min(0).max(100),
  bonusClaimed: z.boolean().default(false),
  completionCount: z.number().default(0), // For repeatable collections
});

// ============================================================================
// Collection Definitions
// ============================================================================

export const COLLECTION_SETS = [
  {
    id: 'starter_set',
    name: 'Focus Fundamentals',
    description: 'Complete your first collection by earning basic rewards',
    theme: 'starter',
    items: [
      { id: 'sf_1', name: 'First Focus', description: 'Complete your first session', rarity: 'COMMON', icon: '🎯', acquired: false, acquiredAt: null, source: 'ACHIEVEMENT' },
      { id: 'sf_2', name: '3-Day Streaker', description: 'Reach a 3-day streak', rarity: 'COMMON', icon: '🔥', acquired: false, acquiredAt: null, source: 'ACHIEVEMENT' },
      { id: 'sf_3', name: 'Deep Diver', description: 'Complete a Deep Work session', rarity: 'UNCOMMON', icon: '🌊', acquired: false, acquiredAt: null, source: 'ACHIEVEMENT' },
      { id: 'sf_4', name: 'Boss Slayer', description: 'Defeat your first boss', rarity: 'UNCOMMON', icon: '⚔️', acquired: false, acquiredAt: null, source: 'BOSS_DROP' },
    ],
    completionBonus: {
      type: 'XP_BOOST',
      amount: 10,
      description: '+10% permanent XP boost',
    },
    difficulty: 'EASY',
  },
  {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Collect all streak milestone badges',
    theme: 'streaks',
    items: [
      { id: 'sm_7', name: 'Week Warrior', description: '7-day streak badge', rarity: 'UNCOMMON', icon: '📅', acquired: false, acquiredAt: null, source: 'ACHIEVEMENT' },
      { id: 'sm_14', name: 'Fortnight Focus', description: '14-day streak badge', rarity: 'RARE', icon: '🗓️', acquired: false, acquiredAt: null, source: 'ACHIEVEMENT' },
      { id: 'sm_30', name: 'Monthly Master', description: '30-day streak badge', rarity: 'EPIC', icon: '📆', acquired: false, acquiredAt: null, source: 'ACHIEVEMENT' },
      { id: 'sm_100', name: 'Century Club', description: '100-day streak badge', rarity: 'LEGENDARY', icon: '💯', acquired: false, acquiredAt: null, source: 'ACHIEVEMENT' },
    ],
    completionBonus: {
      type: 'STREAK_SHIELD',
      amount: 5,
      description: '5 free streak shields',
    },
    difficulty: 'HARD',
  },
  {
    id: 'boss_hunter',
    name: 'Boss Hunter',
    description: 'Collect trophies from all boss types',
    theme: 'bosses',
    items: [
      { id: 'bh_1', name: 'Procrastinator Fang', description: 'Defeated Slacker the Procrastinator', rarity: 'COMMON', icon: '🦷', acquired: false, acquiredAt: null, source: 'BOSS_DROP' },
      { id: 'bh_2', name: 'Demon Horn', description: 'Defeated Distraction Demon', rarity: 'UNCOMMON', icon: '🦄', acquired: false, acquiredAt: null, source: 'BOSS_DROP' },
      { id: 'bh_3', name: 'Infinite Scroll', description: 'Defeated The Infinite Scroller', rarity: 'RARE', icon: '📜', acquired: false, acquiredAt: null, source: 'BOSS_DROP' },
      { id: 'bh_4', name: 'Multitask Mask', description: 'Defeated Master of Multitasking', rarity: 'EPIC', icon: '🎭', acquired: false, acquiredAt: null, source: 'BOSS_DROP' },
      { id: 'bh_5', name: 'Perfectionist Prism', description: 'Defeated The Perfectionist', rarity: 'LEGENDARY', icon: '💎', acquired: false, acquiredAt: null, source: 'BOSS_DROP' },
    ],
    completionBonus: {
      type: 'GEM_BONUS',
      amount: 500,
      description: '500 gems reward',
    },
    difficulty: 'EXTREME',
  },
  {
    id: 'fashion_focus',
    name: 'Fashion Focus',
    description: 'Collect all cosmetic items in the Focus line',
    theme: 'cosmetics',
    items: [
      { id: 'ff_1', name: 'Focus Aura', description: 'Common focus aura cosmetic', rarity: 'COMMON', icon: '✨', acquired: false, acquiredAt: null, source: 'CHEST' },
      { id: 'ff_2', name: 'Concentration Crown', description: 'Rare concentration crown', rarity: 'RARE', icon: '👑', acquired: false, acquiredAt: null, source: 'CHEST' },
      { id: 'ff_3', name: 'Deep Work Robe', description: 'Epic deep work robe', rarity: 'EPIC', icon: '🥋', acquired: false, acquiredAt: null, source: 'BATTLE_PASS' },
      { id: 'ff_4', name: 'Legendary Focus Wings', description: 'Legendary focus wings', rarity: 'LEGENDARY', icon: '🪽', acquired: false, acquiredAt: null, source: 'EVENT' },
    ],
    completionBonus: {
      type: 'EXCLUSIVE_COSMETIC',
      amount: 1,
      description: 'Exclusive "Completionist" title and aura',
    },
    difficulty: 'MEDIUM',
  },
  {
    id: 'mystery_collection',
    name: '???',
    description: 'A secret collection. Can you discover it?',
    theme: 'secret',
    items: [
      { id: 'sc_1', name: 'First Clue', description: 'Found in a Common chest...', rarity: 'RARE', icon: '🧩', acquired: false, acquiredAt: null, source: 'CHEST' },
      { id: 'sc_2', name: 'Second Clue', description: 'Complete a 30-day streak...', rarity: 'RARE', icon: '🧩', acquired: false, acquiredAt: null, source: 'ACHIEVEMENT' },
      { id: 'sc_3', name: 'Third Clue', description: 'Defeat 10 bosses...', rarity: 'RARE', icon: '🧩', acquired: false, acquiredAt: null, source: 'BOSS_DROP' },
      { id: 'sc_4', name: 'Secret Unlocked', description: 'The final piece', rarity: 'LEGENDARY', icon: '🔐', acquired: false, acquiredAt: null, source: 'ACHIEVEMENT' },
    ],
    completionBonus: {
      type: 'TITLE',
      amount: 1,
      description: 'Exclusive "Mystery Solver" title',
    },
    difficulty: 'EXTREME',
    hidden: true,
  },
];

// ============================================================================
// Types
// ============================================================================

export type CollectionItem = z.infer<typeof CollectionItemSchema>;
export type CollectionSet = z.infer<typeof CollectionSetSchema>;
export type UserCollection = z.infer<typeof UserCollectionSchema>;

// ============================================================================
// Collection Management
// ============================================================================

export function getOrCreateUserCollection(
  userId: string,
  setId: string,
  existingUserCollections: UserCollection[]
): UserCollection {
  const existing = existingUserCollections.find((uc) => uc.setId === setId);
  if (existing) {
    return existing;
  }
  
  return UserCollectionSchema.parse({
    userId,
    setId,
    itemsAcquired: [],
    completed: false,
    completedAt: null,
    progress: 0,
    bonusClaimed: false,
    completionCount: 0,
  });
}

export function acquireCollectionItem(
  userCollection: UserCollection,
  collectionSet: CollectionSet,
  itemId: string,
  now: number = Date.now()
): {
  updatedCollection: UserCollection;
  isNew: boolean;
  setCompleted: boolean;
  progress: number;
} {
  // Check if already acquired
  if (userCollection.itemsAcquired.includes(itemId)) {
    return {
      updatedCollection: userCollection,
      isNew: false,
      setCompleted: userCollection.completed,
      progress: userCollection.progress,
    };
  }
  
  // Find item in set
  const item = collectionSet.items.find((i) => i.id === itemId);
  if (!item) {
    throw new Error(`Item ${itemId} not found in set ${collectionSet.id}`);
  }
  
  // Add to acquired items
  const newItemsAcquired = [...userCollection.itemsAcquired, itemId];
  const totalItems = collectionSet.items.length;
  const newProgress = Math.floor((newItemsAcquired.length / totalItems) * 100);
  const wasCompleted = userCollection.completed;
  const nowCompleted = newItemsAcquired.length === totalItems;
  
  const updatedCollection: UserCollection = {
    ...userCollection,
    itemsAcquired: newItemsAcquired,
    completed: nowCompleted,
    completedAt: nowCompleted ? now : userCollection.completedAt,
    progress: newProgress,
    completionCount: nowCompleted && !wasCompleted
      ? userCollection.completionCount + 1
      : userCollection.completionCount,
  };
  
  // Publish events
  eventBus.publish('collection:item_acquired', {
    userId: userCollection.userId,
    setId: collectionSet.id,
    itemId,
    itemName: item.name,
    rarity: item.rarity,
    isNew: true,
  });
  
  if (nowCompleted && !wasCompleted) {
    eventBus.publish('collection:completed', {
      userId: userCollection.userId,
      setId: collectionSet.id,
      rewards: collectionSet.completionBonus,
    });
  }
  
  return {
    updatedCollection,
    isNew: true,
    setCompleted: nowCompleted && !wasCompleted,
    progress: newProgress,
  };
}

// ============================================================================
// Progress Display
// ============================================================================

export function getCollectionProgress(
  userCollection: UserCollection,
  collectionSet: CollectionSet
): {
  totalItems: number;
  acquiredItems: number;
  missingItems: CollectionItem[];
  progressPercent: number;
  nextItem: CollectionItem | null;
  estimatedCompletion: string;
} {
  const totalItems = collectionSet.items.length;
  const acquiredItems = userCollection.itemsAcquired.length;
  const missingItems = collectionSet.items.filter(
    (item) => !userCollection.itemsAcquired.includes(item.id)
  );
  const progressPercent = Math.floor((acquiredItems / totalItems) * 100);
  
  // Estimate completion based on rarity of missing items
  let estimatedDays = 0;
  for (const item of missingItems) {
    switch (item.rarity) {
      case 'COMMON':
        estimatedDays += 1;
        break;
      case 'UNCOMMON':
        estimatedDays += 3;
        break;
      case 'RARE':
        estimatedDays += 7;
        break;
      case 'EPIC':
        estimatedDays += 14;
        break;
      case 'LEGENDARY':
        estimatedDays += 30;
        break;
    }
  }
  
  const nextItem = missingItems.length > 0
    ? missingItems.sort((a, b) => {
        const rarityOrder = { COMMON: 0, UNCOMMON: 1, RARE: 2, EPIC: 3, LEGENDARY: 4 };
        return rarityOrder[a.rarity] - rarityOrder[b.rarity];
      })[0]
    : null;
  
  return {
    totalItems,
    acquiredItems,
    missingItems,
    progressPercent,
    nextItem,
    estimatedCompletion: estimatedDays === 0
      ? 'Complete!'
      : estimatedDays <= 7
        ? 'Within a week'
        : estimatedDays <= 30
          ? 'Within a month'
          : 'Long term goal',
  };
}

// ============================================================================
// Completion Bonus
// ============================================================================

export function claimCompletionBonus(
  userCollection: UserCollection,
  collectionSet: CollectionSet
): {
  success: boolean;
  bonus: CollectionSet['completionBonus'] | null;
  updatedCollection: UserCollection;
  error?: string;
} {
  if (!userCollection.completed) {
    return {
      success: false,
      bonus: null,
      updatedCollection: userCollection,
      error: 'Collection not yet completed',
    };
  }
  
  if (userCollection.bonusClaimed) {
    return {
      success: false,
      bonus: null,
      updatedCollection: userCollection,
      error: 'Bonus already claimed',
    };
  }
  
  const updatedCollection: UserCollection = {
    ...userCollection,
    bonusClaimed: true,
  };
  
  // Publish bonus claim
  eventBus.publish('collection:bonus_claimed', {
    userId: userCollection.userId,
    setId: collectionSet.id,
    bonusId: `${collectionSet.id}-bonus`,
  });
  
  return {
    success: true,
    bonus: collectionSet.completionBonus,
    updatedCollection,
  };
}

// ============================================================================
// UI Helpers
// ============================================================================

export function formatCollectionCard(
  userCollection: UserCollection,
  collectionSet: CollectionSet
): {
  title: string;
  subtitle: string;
  progressBar: string;
  emoji: string;
  color: string;
  status: string;
  missingText: string;
} {
  const progress = userCollection.progress;
  const filled = Math.floor(progress / 10);
  const empty = 10 - filled;
  const progressBar = '█'.repeat(filled) + '░'.repeat(empty) + ` ${progress}%`;
  
  const difficultyColors: Record<string, string> = {
    EASY: '#4CAF50',
    MEDIUM: '#FF9800',
    HARD: '#F44336',
    EXTREME: '#9C27B0',
  };
  
  const themeEmojis: Record<string, string> = {
    starter: '🌱',
    streaks: '🔥',
    bosses: '👹',
    cosmetics: '👗',
    secret: '🔮',
  };
  
  const missingCount = collectionSet.items.length - userCollection.itemsAcquired.length;
  
  return {
    title: collectionSet.hidden && !userCollection.completed ? '???' : collectionSet.name,
    subtitle: collectionSet.hidden && progress < 25
      ? 'A secret collection...'
      : collectionSet.description,
    progressBar,
    emoji: themeEmojis[collectionSet.theme] || '📦',
    color: difficultyColors[collectionSet.difficulty],
    status: userCollection.completed
      ? `✅ Completed ${userCollection.completionCount > 1 ? `x${userCollection.completionCount}` : ''}`
      : `${userCollection.itemsAcquired.length}/${collectionSet.items.length}`,
    missingText: missingCount === 0
      ? 'Set complete!'
      : missingCount === 1
        ? 'Just 1 item remaining!'
        : `${missingCount} items to go`,
  };
}

export function getRarityDisplay(rarity: CollectionItem['rarity']): {
  color: string;
  bgColor: string;
  label: string;
  stars: string;
} {
  const displays: Record<string, { color: string; bgColor: string; label: string; stars: string }> = {
    COMMON: { color: '#9E9E9E', bgColor: '#F5F5F5', label: 'Common', stars: '★' },
    UNCOMMON: { color: '#4CAF50', bgColor: '#E8F5E9', label: 'Uncommon', stars: '★★' },
    RARE: { color: '#2196F3', bgColor: '#E3F2FD', label: 'Rare', stars: '★★★' },
    EPIC: { color: '#9C27B0', bgColor: '#F3E5F5', label: 'Epic', stars: '★★★★' },
    LEGENDARY: { color: '#FF9800', bgColor: '#FFF3E0', label: 'Legendary', stars: '★★★★★' },
  };
  
  return displays[rarity] || displays.COMMON;
}

// ============================================================================
// Discovery Hints (for secret collections)
// ============================================================================

export function getDiscoveryHint(
  collectionSet: CollectionSet,
  currentProgress: number
): string | null {
  if (!collectionSet.hidden) return null;
  if (currentProgress === 0) return null; // Completely hidden
  if (currentProgress < 25) return '🔮 A mysterious collection exists...';
  if (currentProgress < 50) return '🧩 You\'ve found some pieces of a puzzle...';
  if (currentProgress < 75) return '🔍 The picture is becoming clearer...';
  return '🔐 Almost there! The secret will soon be revealed!';
}

// ============================================================================
// Analytics
// ============================================================================

export function trackCollectionAnalytics(
  userId: string,
  action: 'VIEW' | 'ITEM_ACQUIRED' | 'COMPLETED' | 'BONUS_CLAIMED',
  setId: string,
  metadata?: Record<string, unknown>
): void {
  Sentry.addBreadcrumb({
    category: 'collections',
    message: `Collection ${action}`,
    data: { userId, setId, ...metadata },
  });
}
