import React, { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, View, Switch } from 'react-native';

import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import { useNetInfo } from '../../../network';
import { useTheme } from '../../../theme';
import { trackWagerPlaced } from '../analytics';
import { useWallet } from '../hooks';
import {
  calculateInsuranceFee,
  calculatePotentialWin,
  placeWager,
  type ActiveWager,
  type WagerType,
} from '../StreakWagerService';

interface WagerSheetProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  currentStreakDays: number;
  activeWager?: ActiveWager | null;
  onWagerPlaced?: () => void;
}

type WagerOption = {
  type: WagerType;
  title: string;
  description: string;
  defaultBet: number;
  currency: 'COINS' | 'GEMS';
  target: number;
  winMultiplier: number;
};

const WAGER_OPTIONS: WagerOption[] = [
  { type: 'SESSIONS_THIS_WEEK', title: 'Session Master', description: 'Complete 7 sessions this week.', defaultBet: 100, currency: 'COINS', target: 7, winMultiplier: 3.5 },
  { type: 'STREAK_DAYS', title: 'Streak Keeper', description: 'Maintain your streak for 14 days.', defaultBet: 300, currency: 'GEMS', target: 14, winMultiplier: 3 },
];

export function WagerSheet({
  visible,
  onClose,
  userId,
  currentStreakDays,
  activeWager = null,
  onWagerPlaced,
}: WagerSheetProps): JSX.Element {
  const { theme } = useTheme();
  const { isOffline } = useNetInfo();
  const { data: wallet, isLoading: walletLoading, refetch } = useWallet(userId);
  const [selectedType, setSelectedType] = useState<WagerType>('SESSIONS_THIS_WEEK');
  const [betAmount, setBetAmount] = useState(100);
  const [hasInsurance, setHasInsurance] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedOption = useMemo(
    () => WAGER_OPTIONS.find((option) => option.type === selectedType) ?? WAGER_OPTIONS[0],
    [selectedType],
  );
  const insuranceFee = calculateInsuranceFee(betAmount);
  const totalCost = betAmount + (hasInsurance ? insuranceFee : 0);
  const potentialWin = calculatePotentialWin(selectedType, betAmount);
  const balance = selectedOption.currency === 'COINS' ? wallet?.coins ?? 0 : wallet?.gems ?? 0;
  const hasEnoughBalance = balance >= totalCost;
  const shellStyle = {
    backgroundColor: theme.colors.background.secondary,
    borderTopLeftRadius: theme.borderRadius['3xl'],
    borderTopRightRadius: theme.borderRadius['3xl'],
    gap: theme.spacing[4],
    padding: theme.spacing[5],
    paddingBottom: theme.spacing[8],
  };
  const cardStyle = {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[4],
  };

  const handleSelectType = useCallback((type: WagerType): void => {
    const option = WAGER_OPTIONS.find((item) => item.type === type) ?? WAGER_OPTIONS[0];
    setSelectedType(type);
    setBetAmount(option.defaultBet);
    setError(null);
  }, []);

  const handleAdjustBet = useCallback((delta: number): void => {
    setBetAmount((current) => Math.max(50, Math.min(10000, current + delta)));
    setError(null);
  }, []);

  const handlePlaceWager = useCallback(async (): Promise<void> => {
    if (isOffline) {
      setError('No connection - try again when you are back online.');
      return;
    }
    if (currentStreakDays < 3) {
      setError('Build a 3-day streak before putting coins on the line.');
      return;
    }
    if (activeWager) {
      setError('You already have an active wager. Finish it before placing another.');
      return;
    }
    if (!hasEnoughBalance) {
      setError(`Insufficient ${selectedOption.currency.toLowerCase()}.`);
      return;
    }
    setIsPlacing(true);
    setError(null);
    const result = await placeWager({ userId, type: selectedType, currency: selectedOption.currency, betAmount, hasInsurance, currentStreakDays });
    setIsPlacing(false);
    if (!result.success) {
      setError(result.error?.message ?? 'Wager failed. Try again.');
      return;
    }
    trackWagerPlaced(userId, selectedType, betAmount, selectedOption.currency);
    onWagerPlaced?.();
    onClose();
  }, [activeWager, betAmount, currentStreakDays, hasEnoughBalance, hasInsurance, isOffline, onClose, onWagerPlaced, selectedOption.currency, selectedType, userId]);

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <Pressable
        onPress={onClose}
        style={{ backgroundColor: theme.colors.background.overlay, flex: 1, justifyContent: 'flex-end' }}
        accessibilityLabel="Close wager sheet"
        accessibilityRole="button"
      >
        <Pressable onPress={() => undefined} style={shellStyle} accessibilityLabel="Streak wager options">
          <View style={{ gap: theme.spacing[2] }}>
            <Text color={theme.colors.primary[500]} variant="label">STREAK WAGER</Text>
            <Text variant="h3">Bet on your streak</Text>
            <Text color={theme.colors.text.secondary} variant="body">Win up to {selectedOption.winMultiplier}x when you hit the target.</Text>
          </View>

          {activeWager ? (
            <View style={cardStyle}>
              <Text variant="body" fontWeight="700">Active wager</Text>
              <Text color={theme.colors.text.secondary} variant="caption">{activeWager.currentProgress}/{activeWager.target} {activeWager.progressUnit} complete.</Text>
            </View>
          ) : (
            <View style={{ gap: theme.spacing[3] }}>
              {WAGER_OPTIONS.map((option) => (
                <Pressable
                  key={option.type}
                  onPress={() => handleSelectType(option.type)}
                  style={{ ...cardStyle, borderColor: selectedType === option.type ? theme.colors.primary[500] : theme.colors.border.DEFAULT, borderWidth: 2 }}
                  accessibilityLabel={`Select ${option.title} wager`}
                  accessibilityRole="button"
                >
                  <Text variant="body" fontWeight="700">{option.title}</Text>
                  <Text color={theme.colors.text.secondary} variant="caption">{option.description}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {!activeWager && (
            <View style={{ gap: theme.spacing[3] }}>
              <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Button onPress={() => handleAdjustBet(-50)} variant="secondary" accessibilityLabel="Lower wager amount">-</Button>
                <Text variant="h3">{betAmount} {selectedOption.currency.toLowerCase()}</Text>
                <Button onPress={() => handleAdjustBet(50)} variant="secondary" accessibilityLabel="Raise wager amount">+</Button>
              </View>
              <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="body">Loss protection (+{insuranceFee})</Text>
                <Switch value={hasInsurance} onValueChange={setHasInsurance} />
              </View>
              <Text color={theme.colors.success[500]} variant="body">Potential win: {potentialWin} {selectedOption.currency.toLowerCase()}</Text>
            </View>
          )}

          {isOffline && <Text color={theme.colors.warning.DEFAULT} variant="caption">No connection - try again.</Text>}
          {error && <Text color={theme.colors.error[500]} variant="body">{error}</Text>}

          <View style={{ gap: theme.spacing[2] }}>
            {!activeWager && (
              <Button fullWidth isLoading={isPlacing || walletLoading} onPress={handlePlaceWager} variant={hasEnoughBalance && !isOffline ? 'primary' : 'secondary'} accessibilityLabel="Place streak wager">
                {hasEnoughBalance ? `Place wager (${totalCost})` : `Need ${totalCost} ${selectedOption.currency.toLowerCase()}`}
              </Button>
            )}
            {error && <Button fullWidth onPress={() => refetch()} variant="secondary" accessibilityLabel="Retry wager wallet check">Retry</Button>}
            <Button fullWidth onPress={onClose} variant="ghost" accessibilityLabel="Cancel wager">Cancel</Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default WagerSheet;
