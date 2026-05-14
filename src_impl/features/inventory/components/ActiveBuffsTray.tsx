/**
 * Active Buffs Tray Component
 *
 * Phase 15.1 - Shows all active consumables/buffs with countdown timers.
 *
 * Features:
 * - Horizontal scrollable tray of active buffs
 * - Real-time countdown timers
 * - Tap to see buff details
 * - Accessible from Home screen
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, Pressable, Modal } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { useTheme } from '../../../theme';
import { Box, Text, Card } from '../../../components/primitives';
import { Icon } from '../../../icons';

export type BuffType = 'XP_BOOST' | 'FOCUS_POTION' | 'STREAK_SHIELD' | 'COIN_BOOST' | 'GEM_BOOST';

interface ActiveBuff {
  id: string;
  type: BuffType;
  label: string;
  icon: string;
  color: string;
  startedAt: number;
  expiresAt: number;
  effectDescription: string;
}

interface ActiveBuffsTrayProps {
  buffs: ActiveBuff[];
  onBuffPress?: (buff: ActiveBuff) => void;
  compact?: boolean;
}

const BUFF_CONFIG: Record<BuffType, { icon: string; color: string; label: string }> = {
  XP_BOOST: { icon: 'zap', color: '#F59E0B', label: 'XP Boost' },
  FOCUS_POTION: { icon: 'target', color: '#3B82F6', label: 'Focus' },
  STREAK_SHIELD: { icon: 'shield', color: '#10B981', label: 'Shield' },
  COIN_BOOST: { icon: 'coins', color: '#F59E0B', label: 'Coin Boost' },
  GEM_BOOST: { icon: 'gem', color: '#8B5CF6', label: 'Gem Boost' },
};

const formatTimeRemaining = (expiresAt: number): string => {
  const now = Date.now();
  const remaining = Math.max(0, expiresAt - now);

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

const BuffCard: React.FC<{
  buff: ActiveBuff;
  compact?: boolean;
  onPress: () => void;
}> = ({ buff, compact, onPress }) => {
  const { theme } = useTheme();
  const [timeRemaining, setTimeRemaining] = useState(formatTimeRemaining(buff.expiresAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(buff.expiresAt));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [buff.expiresAt]);

  const config = BUFF_CONFIG[buff.type];
  const progress = Math.max(0, Math.min(1, (buff.expiresAt - Date.now()) / (buff.expiresAt - buff.startedAt)));

  if (compact) {
    return (
      <Pressable onPress={onPress} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
        <Box
          mr={8}
          p={8}
          borderRadius={12}
          style={{
            backgroundColor: config.color + '15',
            borderWidth: 1,
            borderColor: config.color + '40',
            minWidth: 70,
            alignItems: 'center',
          }}
        >
          <Icon name={config.icon} size={18} color={config.color} />
          <Text
            variant="caption"
            style={{
              marginTop: 4,
              fontSize: 10,
              fontWeight: '600',
              color: config.color,
            }}
          >
            {timeRemaining}
          </Text>
        </Box>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
      <Box
        mr={12}
        p={12}
        borderRadius={16}
        style={{
          backgroundColor: theme.colors.background.secondary,
          borderWidth: 2,
          borderColor: config.color + '30',
          minWidth: 120,
        }}
      >
        <Box flexDirection="row" alignItems="center" mb={8}>
          <Box width={32} height={32} borderRadius={16} justifyContent="center" alignItems="center" style={{ backgroundColor: config.color + '20' }}>
            <Icon name={config.icon} size={16} color={config.color} />
          </Box>
          <Box ml={8} flex={1}>
            <Text
              variant="caption"
              style={{
                fontWeight: '600',
                color: theme.colors.text.primary,
              }}
            >
              {config.label}
            </Text>
          </Box>
        </Box>

        {/* Progress Bar */}
        <Box
          height={4}
          borderRadius={2}
          mb={8}
          style={{
            backgroundColor: theme.colors.background.tertiary,
            overflow: 'hidden',
          }}
        >
          <Box
            height="100%"
            borderRadius={2}
            style={{
              backgroundColor: config.color,
              width: `${progress * 100}%`,
            }}
          />
        </Box>

        <Text
          variant="caption"
          style={{
            fontSize: 11,
            color: theme.colors.text.secondary,
          }}
        >
          {timeRemaining} remaining
        </Text>
      </Box>
    </Pressable>
  );
};

export const ActiveBuffsTray: React.FC<ActiveBuffsTrayProps> = ({ buffs, onBuffPress, compact = false }) => {
  const { theme } = useTheme();
  const [selectedBuff, setSelectedBuff] = useState<ActiveBuff | null>(null);

  const handleBuffPress = useCallback(
    (buff: ActiveBuff) => {
      setSelectedBuff(buff);
      onBuffPress?.(buff);
    },
    [onBuffPress],
  );

  const handleCloseModal = useCallback(() => {
    setSelectedBuff(null);
  }, []);

  if (buffs.length === 0) {
    return null;
  }

  return (
    <>
      <Box
        p={16}
        style={{
          backgroundColor: theme.colors.background.secondary,
          borderRadius: 16,
          marginHorizontal: 16,
          marginBottom: 16,
        }}
      >
        <Box flexDirection="row" alignItems="center" mb={12}>
          <Icon name="sparkles" size={16} color={theme.colors.primary[500]} />
          <Text
            variant="caption"
            style={{
              marginLeft: 8,
              fontWeight: '600',
              color: theme.colors.text.secondary,
              letterSpacing: 0.5,
            }}
          >
            ACTIVE BUFFS ({buffs.length})
          </Text>
        </Box>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16 }}>
          {buffs.map((buff) => (
            <BuffCard key={buff.id} buff={buff} compact={compact} onPress={() => handleBuffPress(buff)} />
          ))}
        </ScrollView>
      </Box>

      {/* Buff Detail Modal */}
      <Modal visible={selectedBuff !== null} transparent animationType="fade" onRequestClose={handleCloseModal}>
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
          onPress={handleCloseModal}
          accessibilityLabel="Interactive control"
          accessibilityRole="button"
          accessibilityHint="Activates this control"
        >
          {selectedBuff && (
            <Card
              size="lg"
              style={{
                width: 300,
                alignItems: 'center',
                padding: 24,
              }}
            >
              <Box
                width={64}
                height={64}
                borderRadius={32}
                justifyContent="center"
                alignItems="center"
                mb={16}
                style={{
                  backgroundColor: BUFF_CONFIG[selectedBuff.type].color + '20',
                }}
              >
                <Icon name={BUFF_CONFIG[selectedBuff.type].icon} size={32} color={BUFF_CONFIG[selectedBuff.type].color} />
              </Box>

              <Text variant="h4" style={{ marginBottom: 4 }}>
                {BUFF_CONFIG[selectedBuff.type].label}
              </Text>

              <Text variant="body" color="text.secondary" style={{ marginBottom: 16, textAlign: 'center' }}>
                {selectedBuff.effectDescription}
              </Text>

              <Box
                p={12}
                borderRadius={8}
                style={{
                  backgroundColor: theme.colors.background.secondary,
                  width: '100%',
                  alignItems: 'center',
                }}
              >
                <Text variant="caption" color="text.secondary">
                  Expires in
                </Text>
                <Text variant="h4" style={{ marginTop: 4 }}>
                  {formatTimeRemaining(selectedBuff.expiresAt)}
                </Text>
              </Box>

              <Pressable
                onPress={handleCloseModal}
                style={{
                  marginTop: 16,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  backgroundColor: theme.colors.primary[500],
                  borderRadius: 10,
                }}
                accessibilityLabel="Got it button"
                accessibilityRole="button"
                accessibilityHint="Activates this control"
              >
                <Text style={{ color: '#FFF', fontWeight: '600' }}>Got it</Text>
              </Pressable>
            </Card>
          )}
        </Pressable>
      </Modal>
    </>
  );
};

export default ActiveBuffsTray;
