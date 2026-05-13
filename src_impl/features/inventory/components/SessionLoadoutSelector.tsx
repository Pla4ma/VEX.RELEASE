/**
 * SessionLoadoutSelector Component (Phase 5)
 *
 * Replaces placeholder boost UI with real inventory items.
 * Shows compatible consumables, active buffs, and projected impacts.
 *
 * @phase 5
 */

import React from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { useLoadoutOptions } from '../loadout-service';
import type { LoadoutItem, ActiveBuff } from '../schemas';

interface SessionLoadoutSelectorProps {
  userId: string;
  mode: string;
  duration: number; // in seconds
}

/**
 * Individual item card for the loadout selector
 */
function LoadoutItemCard({ item, isSelected }: { item: LoadoutItem; isSelected: boolean }): JSX.Element {
  const rarityColors: Record<string, string> = {
    COMMON: 'theme.colors.primary[500]',
    UNCOMMON: 'theme.colors.primary[500]',
    RARE: 'theme.colors.primary[500]',
    EPIC: 'theme.colors.primary[500]',
    LEGENDARY: 'theme.colors.primary[500]',
  };

  return (
    <View
      style={{
        opacity: item.compatible ? 1 : 0.5,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: isSelected ? rarityColors[item.rarity] : 'theme.colors.primary[500]',
        backgroundColor: isSelected ? `${rarityColors[item.rarity]}20` : 'theme.colors.background.primary',
        marginBottom: 8,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontWeight: '600', color: rarityColors[item.rarity] }}>{item.name}</Text>
        <Text style={{ color: 'theme.colors.primary[500]' }}>x{item.quantity}</Text>
      </View>

      <Text style={{ fontSize: 12, color: 'theme.colors.primary[500]', marginTop: 4 }}>{item.description}</Text>

      {!item.compatible && item.incompatibilityReason && <Text style={{ fontSize: 11, color: 'theme.colors.primary[500]', marginTop: 4 }}>{item.incompatibilityReason}</Text>}

      {item.compatible && (
        <View style={{ flexDirection: 'row', marginTop: 8, gap: 8 }}>
          {item.projectedImpact.xpMultiplier > 1 && <Text style={{ fontSize: 11, color: 'theme.colors.primary[500]' }}>+{Math.round((item.projectedImpact.xpMultiplier - 1) * 100)}% XP</Text>}
          {item.projectedImpact.coinMultiplier > 1 && <Text style={{ fontSize: 11, color: 'theme.colors.primary[500]' }}>+{Math.round((item.projectedImpact.coinMultiplier - 1) * 100)}% Coins</Text>}
          {item.projectedImpact.streakProtection && <Text style={{ fontSize: 11, color: 'theme.colors.primary[500]' }}>Streak Shield</Text>}
          {item.projectedImpact.bossDamageBonus > 0 && <Text style={{ fontSize: 11, color: 'theme.colors.primary[500]' }}>+{item.projectedImpact.bossDamageBonus} Boss Dmg</Text>}
        </View>
      )}
    </View>
  );
}

/**
 * Active buff indicator
 */
function ActiveBuffIndicator({ buff }: { buff: ActiveBuff }): JSX.Element {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        backgroundColor: 'theme.colors.primary[500]',
        borderRadius: 16,
        marginRight: 8,
      }}
    >
      <Text style={{ fontSize: 12, color: 'theme.colors.primary[500]' }}>{buff.name}</Text>
      {buff.effects.xpMultiplier > 1 && <Text style={{ fontSize: 10, color: 'theme.colors.primary[500]', marginLeft: 4 }}>+{Math.round((buff.effects.xpMultiplier - 1) * 100)}% XP</Text>}
    </View>
  );
}

/**
 * SessionLoadoutSelector Component
 *
 * Displays real inventory loadout options for session setup.
 * Shows compatible items, active buffs, and offline restrictions.
 */
export function SessionLoadoutSelector({ userId, mode, duration }: SessionLoadoutSelectorProps): JSX.Element {
  const { data: loadout, isLoading, error } = useLoadoutOptions(userId, mode, duration);

  if (isLoading) {
    return (
      <View style={{ padding: 16, alignItems: 'center' }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8, fontSize: 12, color: 'theme.colors.primary[500]' }}>Loading loadout options...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ color: 'theme.colors.primary[500]' }}>Failed to load inventory. Some options may be unavailable.</Text>
      </View>
    );
  }

  if (!loadout) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ color: 'theme.colors.primary[500]' }}>No loadout data available.</Text>
      </View>
    );
  }

  const compatibleItems = loadout.available.filter((item) => item.compatible);
  const incompatibleItems = loadout.available.filter((item) => !item.compatible);

  return (
    <View style={{ padding: 16 }}>
      {/* Active Buffs */}
      {loadout.activeBuffs.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontWeight: '600', marginBottom: 8 }}>Active Buffs ({loadout.summary.activeBuffs})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {loadout.activeBuffs.map((buff) => (
              <ActiveBuffIndicator key={buff.id} buff={buff} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Loadout Summary */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: 'theme.colors.primary[500]',
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: 'theme.colors.primary[500]' }}>{loadout.summary.projectedXpMultiplier}x</Text>
          <Text style={{ fontSize: 10, color: 'theme.colors.primary[500]' }}>XP Multiplier</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: 'theme.colors.primary[500]' }}>{loadout.summary.projectedCoinMultiplier}x</Text>
          <Text style={{ fontSize: 10, color: 'theme.colors.primary[500]' }}>Coin Multiplier</Text>
        </View>
        {loadout.summary.hasStreakProtection && (
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: 'theme.colors.primary[500]' }}>Shield</Text>
            <Text style={{ fontSize: 10, color: 'theme.colors.primary[500]' }}>Protected</Text>
          </View>
        )}
      </View>

      {/* Compatible Items */}
      {compatibleItems.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontWeight: '600', marginBottom: 8 }}>Available Items ({compatibleItems.length})</Text>
          {compatibleItems.map((item) => (
            <LoadoutItemCard key={item.id} item={item} isSelected={false} />
          ))}
        </View>
      )}

      {/* Incompatible Items (disabled) */}
      {incompatibleItems.length > 0 && (
        <View style={{ marginBottom: 16, opacity: 0.6 }}>
          <Text style={{ fontWeight: '600', marginBottom: 8, color: 'theme.colors.primary[500]' }}>Incompatible ({incompatibleItems.length})</Text>
          {incompatibleItems.slice(0, 3).map((item) => (
            <LoadoutItemCard key={item.id} item={item} isSelected={false} />
          ))}
          {incompatibleItems.length > 3 && <Text style={{ fontSize: 12, color: 'theme.colors.primary[500]', textAlign: 'center' }}>+{incompatibleItems.length - 3} more items</Text>}
        </View>
      )}

      {/* Offline Restrictions */}
      {loadout.offlineRestrictions.length > 0 && (
        <View
          style={{
            backgroundColor: 'theme.colors.primary[500]',
            padding: 12,
            borderRadius: 8,
            borderLeftWidth: 4,
            borderLeftColor: 'theme.colors.primary[500]',
          }}
        >
          <Text style={{ fontWeight: '600', fontSize: 12, color: 'theme.colors.primary[500]', marginBottom: 4 }}>Offline Restrictions</Text>
          {loadout.offlineRestrictions.map((restriction, index) => (
            <Text key={index} style={{ fontSize: 11, color: 'theme.colors.primary[500]' }}>
              • {restriction}
            </Text>
          ))}
        </View>
      )}

      {/* No Items State */}
      {loadout.available.length === 0 && (
        <View style={{ alignItems: 'center', padding: 24 }}>
          <Text style={{ color: 'theme.colors.primary[500]', textAlign: 'center' }}>No items in your inventory. Visit the shop to get boosts and consumables.</Text>
        </View>
      )}
    </View>
  );
}

export default SessionLoadoutSelector;

export * from "./SessionLoadoutSelector.types";
