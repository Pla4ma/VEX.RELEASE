/**
 * Shop Constants
 * Shared constants for the shop screen
 */

import { Dimensions } from 'react-native';
import type { ItemType } from '../../items/schemas';

const { width } = Dimensions.get('window');

export const ITEMS_PER_ROW = 3;
export const ITEM_WIDTH = (width - 48) / ITEMS_PER_ROW;

export type ShopCategory = 'ALL' | ItemType | 'OFFERS';

export const CATEGORIES: { key: ShopCategory; label: string; icon: string }[] = [
  { key: 'ALL', label: 'All', icon: '🛍️' },
  { key: 'CONSUMABLE', label: 'Items', icon: '🧪' },
  { key: 'EQUIPMENT', label: 'Gear', icon: '⚔️' },
  { key: 'COSMETIC', label: 'Style', icon: '👑' },
  { key: 'CRAFTING', label: 'Craft', icon: '🔧' },
  { key: 'OFFERS', label: 'Deals', icon: '🔥' },
];

export const RARITY_COLORS = {
  COMMON: 'theme.colors.primary[500]',
  UNCOMMON: 'theme.colors.primary[500]',
  RARE: 'theme.colors.primary[500]',
  EPIC: 'theme.colors.primary[500]',
  LEGENDARY: 'theme.colors.primary[500]',
};
