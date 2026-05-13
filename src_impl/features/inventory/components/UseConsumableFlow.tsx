/**
 * Use Consumable Flow Component
 *
 * Phase 15.1 - Consumable use flow with confirmation and visual feedback.
 *
 * Features:
 * - Confirmation modal when using consumable
 * - Immediate effect application with visual feedback
 * - Integration with ActiveBuffs system
 */

import React, { useState, useCallback } from 'react';
import { Modal, Pressable, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming } from 'react-native-reanimated';

import { useTheme } from '../../../theme';
import { Box, Text, Card } from '../../../components/primitives';
import { Icon } from '../../../icons';
import { useUIStore } from '../../../store/index';
import type { InventoryItem } from '../types';

type ConsumableType =
  | 'XP_BOOST'
  | 'FOCUS_POTION'
  | 'STREAK_SHIELD'
  | 'COIN_BOOST'
  | 'GEM_BOOST'
  // PHASE 5.5: New premium consumables
  | 'VOID_FRAGMENT' // Rare - 50 extra boss damage
  | 'FOCUS_CRYSTAL' // Uncommon - Reduces purity threshold by 10
  | 'CHAIN_BREAKER'; // Rare - Restores broken SPRINT chain

interface ConsumableEffect {
  type: ConsumableType;
  label: string;
  description: string;
  icon: string;
  color: string;
  duration: number; // minutes
  effectDescription: string;
}

const CONSUMABLE_EFFECTS: Record<string, ConsumableEffect> = {
  XP_BOOST: {
    type: 'XP_BOOST',
    label: 'XP Boost',
    description: '+25% XP for 30 minutes',
    icon: 'zap',
    color: 'theme.colors.primary[500]',
    duration: 30,
    effectDescription: 'All XP gains increased by 25%',
  },
  FOCUS_POTION: {
    type: 'FOCUS_POTION',
    label: 'Focus Potion',
    description: '+10% session quality for next session',
    icon: 'target',
    color: 'theme.colors.primary[500]',
    duration: 60,
    effectDescription: 'Next session gets +10% quality bonus',
  },
  STREAK_SHIELD: {
    type: 'STREAK_SHIELD',
    label: 'Streak Shield',
    description: 'Protects streak for 24 hours',
    icon: 'shield',
    color: 'theme.colors.primary[500]',
    duration: 1440, // 24 hours
    effectDescription: 'Streak protected from breaking',
  },
  COIN_BOOST: {
    type: 'COIN_BOOST',
    label: 'Coin Boost',
    description: '+50% coins for 1 hour',
    icon: 'coins',
    color: 'theme.colors.primary[500]',
    duration: 60,
    effectDescription: 'All coin rewards increased by 50%',
  },
  GEM_BOOST: {
    type: 'GEM_BOOST',
    label: 'Gem Boost',
    description: 'Double gem drops for 2 hours',
    icon: 'gem',
    color: 'theme.colors.primary[500]',
    duration: 120,
    effectDescription: 'Gem drop rate doubled',
  },
  // PHASE 5.5: New premium consumables
  VOID_FRAGMENT: {
    type: 'VOID_FRAGMENT',
    label: 'Void Fragment',
    description: 'Deals 50 extra boss damage next session',
    icon: 'skull', // Using skull icon for void/dark theme
    color: 'theme.colors.primary[500]', // Indigo for rare rarity
    duration: 0, // One-time use, applied immediately on session
    effectDescription: '+50 guaranteed boss damage on next encounter',
  },
  FOCUS_CRYSTAL: {
    type: 'FOCUS_CRYSTAL',
    label: 'Focus Crystal',
    description: 'Reduces purity threshold for this session',
    icon: 'diamond',
    color: 'theme.colors.primary[500]', // Green for uncommon rarity
    duration: 0, // Applies to next session only
    effectDescription: 'Purity threshold reduced by 10 points (easier passing)',
  },
  CHAIN_BREAKER: {
    type: 'CHAIN_BREAKER',
    label: 'Chain Breaker',
    description: 'Restores broken SPRINT chain',
    icon: 'link',
    color: 'theme.colors.primary[500]', // Indigo for rare rarity
    duration: 0, // One-time use, immediate effect
    effectDescription: 'Instantly restore your broken SPRINT chain progress',
  },
};

interface UseConsumableFlowProps {
  item: InventoryItem;
  itemDefinition?: {
    id: string;
    name: string;
    icon: string;
    description: string;
    effectType: ConsumableType;
  };
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const UseConsumableFlow: React.FC<UseConsumableFlowProps> = ({ item, itemDefinition, visible, onClose, onConfirm }) => {
  const { theme } = useTheme();
  const { showToast } = useUIStore();
  const [isUsing, setIsUsing] = useState(false);

  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  React.useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 15 });
    } else {
      opacity.value = 0;
      scale.value = 0.8;
    }
  }, [visible, opacity, scale]);

  const effect = itemDefinition?.effectType ? CONSUMABLE_EFFECTS[itemDefinition.effectType] : null;

  const handleConfirm = useCallback(async () => {
    setIsUsing(true);

    // Animate the usage
    scale.value = withSequence(withSpring(0.95, { damping: 10 }), withSpring(1.05, { damping: 10 }), withSpring(0, { damping: 15 }));

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 600));

    setIsUsing(false);
    onConfirm();
    onClose();

    // Show success toast
    showToast({
      message: `${effect?.label || 'Item'} activated!`,
      type: 'success',
      duration: 3000,
    });
  }, [effect, onConfirm, onClose, scale, showToast]);

  if (!effect) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View
        style={[
          {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          },
          containerStyle,
        ]}
      >
        <Animated.View style={cardStyle}>
          <Card
            size="lg"
            style={{
              width: 320,
              maxWidth: '100%',
              alignItems: 'center',
              padding: 24,
            }}
          >
            {/* Item Icon */}
            <Box
              width={80}
              height={80}
              borderRadius={40}
              justifyContent="center"
              alignItems="center"
              mb={16}
              style={{
                backgroundColor: effect.color + '20',
                borderWidth: 3,
                borderColor: effect.color,
              }}
            >
              <Icon name={effect.icon} size={36} color={effect.color} />
            </Box>

            {/* Title */}
            <Text variant="h3" style={{ marginBottom: 8, textAlign: 'center' }}>
              Use {itemDefinition?.name || effect.label}?
            </Text>

            {/* Description */}
            <Text variant="body" color="text.secondary" style={{ marginBottom: 20, textAlign: 'center' }}>
              {effect.description}
            </Text>

            {/* Effect Details */}
            <Box
              width="100%"
              p={16}
              borderRadius={12}
              mb={20}
              style={{
                backgroundColor: theme.colors.background.secondary,
                borderLeftWidth: 4,
                borderLeftColor: effect.color,
              }}
            >
              <Box flexDirection="row" alignItems="center" mb={8}>
                <Icon name="sparkles" size={16} color={effect.color} />
                <Text
                  variant="caption"
                  style={{
                    marginLeft: 8,
                    fontWeight: '600',
                    color: effect.color,
                  }}
                >
                  EFFECT
                </Text>
              </Box>
              <Text variant="body" style={{ marginBottom: 4 }}>
                {effect.effectDescription}
              </Text>
              <Text variant="caption" color="text.secondary">
                Duration: {effect.duration >= 60 ? `${Math.floor(effect.duration / 60)} hour${effect.duration >= 120 ? 's' : ''}` : `${effect.duration} minutes`}
              </Text>
            </Box>

            {/* Quantity Warning */}
            {item.quantity <= 1 && (
              <Box
                width="100%"
                p={12}
                borderRadius={8}
                mb={16}
                style={{
                  backgroundColor: theme.colors.warning[50] || 'theme.colors.error.DEFAULT',
                  borderWidth: 1,
                  borderColor: theme.colors.warning.DEFAULT + '30',
                }}
              >
                <Box flexDirection="row" alignItems="center">
                  <Icon name="alert-triangle" size={16} color={theme.colors.warning.DEFAULT} />
                  <Text
                    variant="caption"
                    style={{
                      marginLeft: 8,
                      color: theme.colors.warning.DEFAULT,
                      fontWeight: '500',
                    }}
                  >
                    This is your last one!
                  </Text>
                </Box>
              </Box>
            )}

            {/* Action Buttons */}
            <Box flexDirection="row" width="100%">
              <Pressable
                onPress={onClose}
                disabled={isUsing}
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.background.secondary,
                  paddingVertical: 14,
                  borderRadius: 10,
                  alignItems: 'center',
                  marginRight: 8,
                  opacity: isUsing ? 0.5 : 1,
                }}
                accessibilityLabel="Cancel button"
                accessibilityRole="button"
                accessibilityHint="Activates this control"
              >
                <Text
                  style={{
                    color: theme.colors.text.primary,
                    fontWeight: '600',
                    fontSize: 16,
                  }}
                >
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleConfirm}
                disabled={isUsing}
                style={{
                  flex: 1,
                  backgroundColor: effect.color,
                  paddingVertical: 14,
                  borderRadius: 10,
                  alignItems: 'center',
                  marginLeft: 8,
                  opacity: isUsing ? 0.7 : 1,
                }}
                accessibilityLabel="Interactive control"
                accessibilityRole="button"
                accessibilityHint="Activates this control"
              >
                <Box flexDirection="row" alignItems="center">
                  {isUsing ? (
                    <Animated.View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: 'theme.colors.background.primary',
                        borderTopColor: 'transparent',
                      }}
                    />
                  ) : (
                    <Icon name="check" size={18} color="theme.colors.background.primary" />
                  )}
                  <Text
                    style={{
                      color: 'theme.colors.background.primary',
                      fontWeight: '600',
                      fontSize: 16,
                      marginLeft: 8,
                    }}
                  >
                    {isUsing ? 'Using...' : 'Use Now'}
                  </Text>
                </Box>
              </Pressable>
            </Box>
          </Card>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default UseConsumableFlow;

export * from "./UseConsumableFlow.types";
