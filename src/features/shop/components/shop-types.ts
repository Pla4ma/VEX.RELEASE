/**
 * Shop Types
 * Type definitions for the shop screen
 */

import type { ItemDefinition } from '../../items/schemas';
import type { LimitedOffer } from '../../economy/schemas';
import type { ShopCategory } from './shop-constants';

export interface ShopScreenProps {
  userId: string;
  userLevel: number;
}

export interface ShopItemCardProps {
  item: ItemDefinition;
  offer?: LimitedOffer;
  userLevel: number;
  onPress: () => void;
  disabled?: boolean;
}

export interface PurchaseModalProps {
  visible: boolean;
  item: ItemDefinition | null;
  offer: LimitedOffer | null;
  userCoins: number;
  userGems: number;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing: boolean;
}

export interface ShopErrorProps {
  error: Error;
  onRetry: () => void;
}

export type { ShopCategory } from './shop-constants';
