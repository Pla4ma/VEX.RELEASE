import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
/**
 * VaultScreen
 *
 * Inventory screen showing all unopened chests.
 * Tap chest to open, see rarity glow, capacity indicator.
 * Mystery box pattern shows ? until opened.
 */

import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

import { Box } from '../../components/primitives/Box';
import { Text } from '../../components/primitives/Text';
import { useTheme } from '../../theme';
import { RewardChest } from '../../features/rewards/components/reward-chest';
import { useRewards } from '../../features/rewards/hooks';
import type { RootStackParams } from '../../navigation/types';
import { ChestCard } from './components/ChestCard';
import { EmptyVault } from './components/EmptyVault';
import { CapacityIndicator } from './components/CapacityIndicator';

export interface MysteryChest {
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

export function VaultScreen({ userId }: VaultScreenProps): JSX.Element {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParams>>();
  const { chests, isLoading, openChest } = useRewards(userId);

  const [selectedChest, setSelectedChest] = useState<MysteryChest | null>(null);
  const [chestModalVisible, setChestModalVisible] = useState(false);

  const unopenedChests = chests.filter((c: MysteryChest) => !c.isOpened);
  const openedChests = chests.filter((c: MysteryChest) => c.isOpened);

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
        <Box mb="lg">
          <Text variant="h2" color="text.primary">
            Vault
          </Text>
          <Text variant="body" color="text.secondary">
            Tap a mystery chest to reveal its contents
          </Text>
        </Box>

        <CapacityIndicator current={unopenedChests.length} max={MAX_CHESTS} />

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

export default withScreenErrorBoundary(VaultScreen, 'Vault');
