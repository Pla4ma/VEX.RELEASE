import React, { useMemo, useState } from 'react';

import { Modal } from '../../components/overlays/Modal';
import { Box } from '../../components/primitives/Box';
import { Button } from '../../components/primitives/Button';
import { Text } from '../../components/primitives/Text';
import { useWallet } from '../economy/hooks';
import type { Streak } from '../streaks/schemas';
import { usePurchaseTheme } from './hooks';
import { canPurchaseTheme } from './service';
import type { SessionTheme } from './session-themes';

interface ThemeShopModalProps {
  userId: string;
  isVisible: boolean;
  theme: SessionTheme | null;
  streak: Pick<Streak, 'longestDays'> | null;
  onClose: () => void;
  onPurchased: (themeId: string) => void;
  onGetCoins: () => void;
}

export function ThemeShopModal({
  userId,
  isVisible,
  theme,
  streak,
  onClose,
  onPurchased,
  onGetCoins,
}: ThemeShopModalProps): JSX.Element | null {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const walletQuery = useWallet(userId);
  const purchaseThemeMutation = usePurchaseTheme();

  const gate = useMemo(() => {
    if (!theme) {
      return { allowed: false, message: null };
    }

    return canPurchaseTheme((theme as any).id, streak);
  }, [streak, theme]);

  if (!theme) {
    return null;
  }

  const balance = walletQuery.data?.coins ?? 0;
  const canAfford = balance >= (theme as any).coinCost;
  const showInsufficientCoins =
    errorMessage === 'Not enough coins' || (!canAfford && !(theme as any).isFree);

  const handleBuy = async (): Promise<void> => {
    if (!theme) {
      return;
    }

    setErrorMessage(null);
    const result = await purchaseThemeMutation.mutateAsync({
      userId,
      themeId: (theme as any).id,
      streak,
    });

    if (!result.success) {
      setErrorMessage(result.errorMessage);
      return;
    }

    onPurchased((theme as any).id);
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      onClose={onClose}
      title={(theme as any).name}
      contentStyle={{ paddingBottom: 0 }}
    >
      <Box gap="md">
        <Box flexDirection="row" alignItems="center" gap="md">
          <Box
            width={56}
            height={56}
            borderRadius={999}
            style={{ backgroundColor: (theme as any).previewColor }}
          />
          <Box flex={1}>
            <Text variant="body" color="text.secondary">
              {(theme as any).description}
            </Text>
            <Text variant="label" mt="sm">
              {(theme as any).isFree ? 'Free unlock' : `${(theme as any).coinCost} coins`}
            </Text>
          </Box>
        </Box>

        <Box
          p="md"
          borderRadius={16}
          style={{
            backgroundColor: (theme as any).backgroundTint === 'transparent'
              ? 'rgba(99, 102, 241, 0.08)'
              : (theme as any).backgroundTint,
          }}
        >
          <Text variant="caption" color="text.secondary">
            Preview tint
          </Text>
          <Text variant="body" mt="xs">
            Timer ring shifts to this accent during focus sessions.
          </Text>
        </Box>

        <Box>
          <Text variant="caption" color="text.secondary">
            Current balance
          </Text>
          <Text variant="h4">{balance} coins</Text>
        </Box>

        {gate.message ? (
          <Text variant="body" color="warning.DEFAULT">
            {gate.message}
          </Text>
        ) : null}

        {errorMessage && errorMessage !== gate.message ? (
          <Text
            variant="body"
            color={showInsufficientCoins ? 'warning.DEFAULT' : 'error.DEFAULT'}
          >
            {errorMessage}
          </Text>
        ) : null}

        <Button
          fullWidth
          onPress={() => void handleBuy()}
          isLoading={purchaseThemeMutation.isPending}
          isDisabled={!gate.allowed}

        accessibilityLabel="coins`} button"
        accessibilityRole="button"
        accessibilityHint="Activates this control">
          {(theme as any).isFree ? 'Unlock Theme' : `Buy for ${(theme as any).coinCost} coins`}
        </Button>

        {showInsufficientCoins ? (
          <Button variant="outline" fullWidth onPress={onGetCoins}
  accessibilityLabel="Get Coins button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
            Get Coins
          </Button>
        ) : null}
      </Box>
    </Modal>
  );
}

export default ThemeShopModal;
