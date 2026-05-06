/**
 * VaultScreen
 *
 * Inventory screen showing all unopened chests.
 * Tap chest to open, see rarity glow, capacity indicator.
 * Mystery box pattern shows ? until opened.
 *
 * @phase 4.5
 */

import React, { useState } from 'react';
import { Pressable, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

import { Box } from '../../components/primitives/Box';
import { Text } from '../../components/primitives/Text';
import { Button } from '../../components/primitives/Button';
import { useTheme } from '../../theme';
import { RewardChest } from '../../features/rewards/components/reward-chest';
import { useRewards } from '../../features/rewards/hooks';
import type { RootStackParams } from '../../navigation/types';

interface MysteryChest {
  id: string;
  tier: 'WOOD' | 'SILVER' | 'GOLD' | 'LEGENDARY';
  obtainedAt: number;
  source: 'SESSION' | 'BOSS' | 'DAILY' | 'ACHIEVEMENT';
  isOpened: boolean;
}

interface VaultScreenProps {
  userId: string;
}

const MAX_CHESTS = 3;

const TIER_CONFIG = {
  WOOD: {
    colors: ['#8B4513', '#654321'] as const,
    emoji: '📦',
    label: 'Wood Chest',
    glow: '#8B4513',
  },
  SILVER: {
    colors: ['#C0C0C0', '#808080'] as const,
    emoji: '🥈',
    label: 'Silver Chest',
    glow: '#C0C0C0',
  },
  GOLD: {
    colors: ['#FFD700', '#FFA000'] as const,
    emoji: '🏆',
    label: 'Gold Chest',
    glow: '#FFD700',
  },
  LEGENDARY: {
    colors: ['#FFD700', '#FF6B35', '#8B5CF6'] as const,
    emoji: '👑',
    label: 'Legendary Chest',
    glow: '#FF6B35',
  },
};

/**
 * Chest card component with mystery box pattern
 */
function ChestCard({
  chest,
  index,
  onPress,
}: {
  chest: MysteryChest;
  index: number;
  onPress: () => void;
}): JSX.Element {
  const { theme } = useTheme();
  const config = TIER_CONFIG[chest.tier];

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 100).duration(400)}
      style={{ flex: 1, minWidth: 140, maxWidth: '48%' }}
    >
      <Pressable onPress={onPress}
  accessibilityLabel="Interactive control"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
        <Box
          p="lg"
          borderRadius="xl"
          bg={theme.colors.background.secondary}
          borderWidth={2}
          borderColor={config.glow}
          style={{
            shadowColor: config.glow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          {/* Mystery box - shows ? until opened, then emoji */}
          <Box
            width={80}
            height={80}
            borderRadius="lg"
            bg={`${config.glow}20`}
            justifyContent="center"
            alignItems="center"
            alignSelf="center"
            mb="md"
            style={{
              backgroundColor: chest.isOpened
                ? `${config.glow}30`
                : theme.colors.background.tertiary,
            }}
          >
            <Text fontSize={40}>
              {chest.isOpened ? config.emoji : '❓'}
            </Text>
          </Box>

          {/* Tier label */}
          <Text
            variant="bodySmall"
            color={chest.isOpened ? 'text.secondary' : config.glow}
            textAlign="center"
            fontWeight="600"
          >
            {chest.isOpened ? config.label : 'Mystery Chest'}
          </Text>

          {/* Source tag */}
          <Box
            mt="xs"
            px="sm"
            py="xs"
            borderRadius="full"
            bg={theme.colors.background.tertiary}
            alignSelf="center"
          >
            <Text variant="caption" color="text.tertiary">
              {chest.source}
            </Text>
          </Box>

          {/* Opened indicator */}
          {chest.isOpened && (
            <Box
              mt="sm"
              flexDirection="row"
              alignItems="center"
              justifyContent="center"
              gap="xs"
            >
              <Text fontSize={12}>✓</Text>
              <Text variant="caption" color="success.DEFAULT">
                Opened
              </Text>
            </Box>
          )}
        </Box>
      </Pressable>
    </Animated.View>
  );
}

/**
 * Empty vault state
 */
function EmptyVault({ onGetChest }: { onGetChest: () => void }): JSX.Element {
  const { theme } = useTheme();

  return (
    <Animated.View entering={FadeIn.duration(400)}>
      <Box
        flex={1}
        justifyContent="center"
        alignItems="center"
        py="3xl"
        px="lg"
      >
        <Box
          width={120}
          height={120}
          borderRadius="full"
          bg={theme.colors.background.tertiary}
          justifyContent="center"
          alignItems="center"
          mb="xl"
        >
          <Text fontSize={48}>📦</Text>
        </Box>

        <Text variant="h3" color="text.primary" textAlign="center" mb="md">
          Your Vault is Empty
        </Text>

        <Text
          variant="body"
          color="text.secondary"
          textAlign="center"
          mb="2xl"
        >
          Complete focus sessions to earn chests! Longer sessions and higher
          purity scores give better rewards.
        </Text>

        <Button variant="primary" size="lg" onPress={onGetChest}
  accessibilityLabel="Start a Session button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
          Start a Session
        </Button>
      </Box>
    </Animated.View>
  );
}

/**
 * Capacity indicator showing slots used
 */
function CapacityIndicator({
  current,
  max,
}: {
  current: number;
  max: number;
}): JSX.Element {
  const { theme } = useTheme();
  const isFull = current >= max;

  return (
    <Box
      flexDirection="row"
      alignItems="center"
      gap="sm"
      px="lg"
      py="md"
      borderRadius="lg"
      bg={isFull ? `${theme.colors.warning.DEFAULT}15` : theme.colors.background.secondary}
      borderWidth={1}
      borderColor={isFull ? theme.colors.warning.DEFAULT : theme.colors.border.light}
      mb="lg"
    >
      <Text fontSize={16}>{isFull ? '⚠️' : '📦'}</Text>
      <Box flex={1}>
        <Text variant="bodySmall" color={isFull ? 'warning.DEFAULT' : 'text.secondary'}>
          {isFull ? 'Vault Full!' : 'Vault Capacity'}
        </Text>
        <Box
          height={4}
          borderRadius="full"
          bg={theme.colors.background.tertiary}
          mt="xs"
          overflow="hidden"
        >
          <Box
            width={`${(current / max) * 100}%`}
            height="100%"
            borderRadius="full"
            bg={isFull ? theme.colors.warning.DEFAULT : theme.colors.primary[500]}
          />
        </Box>
      </Box>
      <Text variant="caption" color={isFull ? 'warning.DEFAULT' : 'text.secondary'}>
        {current}/{max}
      </Text>
    </Box>
  );
}

export function VaultScreen({ userId }: VaultScreenProps): JSX.Element {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParams>>();
  const { chests, isLoading, openChest } = useRewards(userId);

  const [selectedChest, setSelectedChest] = useState<MysteryChest | null>(null);
  const [chestModalVisible, setChestModalVisible] = useState(false);

  const unopenedChests = chests.filter((c) => !c.isOpened);
  const openedChests = chests.filter((c) => c.isOpened);

  const handleChestPress = (chest: MysteryChest) => {
    if (chest.isOpened) {return;}
    setSelectedChest(chest);
    setChestModalVisible(true);
  };

  const handleClaim = async (chestId: string) => {
    await openChest(chestId);
    setChestModalVisible(false);
    setSelectedChest(null);
  };

  const handleCloseModal = () => {
    setChestModalVisible(false);
    setSelectedChest(null);
  };

  const navigateToSession = () => {
    navigation.navigate('SessionStack', { screen: 'SessionSetup' });
  };

  if (isLoading) {
    return (
      <Box flex={1} bg="background.primary" justifyContent="center" alignItems="center">
        <Text variant="body" color="text.secondary">
          Loading vault...
        </Text>
      </Box>
    );
  }

  if (chests.length === 0) {
    return (
      <Box flex={1} bg="background.primary" px="lg" pt="xl">
        <Text variant="h2" color="text.primary" mb="lg">
          Vault
        </Text>
        <EmptyVault onGetChest={navigateToSession} />
      </Box>
    );
  }

  return (
    <Box flex={1} bg="background.primary">
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Box mb="lg">
          <Text variant="h2" color="text.primary">
            Vault
          </Text>
          <Text variant="body" color="text.secondary">
            Tap a mystery chest to reveal its contents
          </Text>
        </Box>

        {/* Capacity */}
        <CapacityIndicator current={unopenedChests.length} max={MAX_CHESTS} />

        {/* Unopened Chests */}
        {unopenedChests.length > 0 && (
          <Box mb="xl">
            <Text variant="h4" color="text.primary" mb="md">
              Mystery Chests ({unopenedChests.length})
            </Text>
            <Box flexDirection="row" flexWrap="wrap" gap="md">
              {unopenedChests.map((chest: MysteryChest, index: number) => (
                <ChestCard
                  key={chest.id}
                  chest={chest}
                  index={index}
                  onPress={() => handleChestPress(chest)}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Opened Chests History */}
        {openedChests.length > 0 && (
          <Box>
            <Text variant="h4" color="text.secondary" mb="md">
              Opened ({openedChests.length})
            </Text>
            <Box flexDirection="row" flexWrap="wrap" gap="md">
              {openedChests.slice(0, 6).map((chest: MysteryChest, index: number) => (
                <ChestCard
                  key={chest.id}
                  chest={chest}
                  index={index + unopenedChests.length}
                  onPress={() => {}}
                />
              ))}
            </Box>
          </Box>
        )}
      </ScrollView>

      {/* Chest Opening Modal */}
      {selectedChest && (
        <RewardChest
          isVisible={chestModalVisible}
          chestType={selectedChest.tier}
          reason={`From ${selectedChest.source.toLowerCase()} session`}
          rewards={[
            { id: '1', type: 'XP', amount: 100, rarity: 'COMMON' },
            { id: '2', type: 'COINS', amount: 50, rarity: 'COMMON' },
          ]}
          onClaim={() => handleClaim(selectedChest.id)}
          onClose={handleCloseModal}
        />
      )}
    </Box>
  );
}

export default VaultScreen;
