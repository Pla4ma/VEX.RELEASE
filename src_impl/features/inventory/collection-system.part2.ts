import { eventBus } from "../../events";
import * as Sentry from "@sentry/react-native";
import { z } from "zod";


export function getCollectionProgress(
  userCollection: UserCollection,
  collectionSet: CollectionSet,
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
  const missingItems = collectionSet.items.filter((item) => !userCollection.itemsAcquired.includes(item.id));
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

  const nextItem =
    missingItems.length > 0
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
    estimatedCompletion: estimatedDays === 0 ? 'Complete!' : estimatedDays <= 7 ? 'Within a week' : estimatedDays <= 30 ? 'Within a month' : 'Long term goal',
  };
}

export function claimCompletionBonus(
  userCollection: UserCollection,
  collectionSet: CollectionSet,
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

export function formatCollectionCard(
  userCollection: UserCollection,
  collectionSet: CollectionSet,
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
    EASY: 'theme.colors.primary[500]',
    MEDIUM: 'theme.colors.error.DEFAULT',
    HARD: 'theme.colors.primary[500]',
    EXTREME: 'theme.colors.primary[500]',
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
    subtitle: collectionSet.hidden && progress < 25 ? 'A secret collection...' : collectionSet.description,
    progressBar,
    emoji: themeEmojis[collectionSet.theme] || '📦',
    color: difficultyColors[collectionSet.difficulty],
    status: userCollection.completed ? `✅ Completed ${userCollection.completionCount > 1 ? `x${userCollection.completionCount}` : ''}` : `${userCollection.itemsAcquired.length}/${collectionSet.items.length}`,
    missingText: missingCount === 0 ? 'Set complete!' : missingCount === 1 ? 'Just 1 item remaining!' : `${missingCount} items to go`,
  };
}

export function getRarityDisplay(rarity: CollectionItem['rarity']): {
  color: string;
  bgColor: string;
  label: string;
  stars: string;
} {
  const displays: Record<string, { color: string; bgColor: string; label: string; stars: string }> = {
    COMMON: { color: 'theme.colors.primary[500]', bgColor: 'theme.colors.primary[500]', label: 'Common', stars: '★' },
    UNCOMMON: { color: 'theme.colors.primary[500]', bgColor: 'theme.colors.primary[500]', label: 'Uncommon', stars: '★★' },
    RARE: { color: 'theme.colors.primary[500]', bgColor: 'theme.colors.primary[500]', label: 'Rare', stars: '★★★' },
    EPIC: { color: 'theme.colors.primary[500]', bgColor: 'theme.colors.primary[500]', label: 'Epic', stars: '★★★★' },
    LEGENDARY: { color: 'theme.colors.error.DEFAULT', bgColor: 'theme.colors.error.DEFAULT', label: 'Legendary', stars: '★★★★★' },
  };

  return displays[rarity] || displays.COMMON;
}