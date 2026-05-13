import React, { useRef } from 'react';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, View } from 'react-native';

import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import { Skeleton } from '../../../components/ui/Skeleton';
import { AnimatedCounter } from '../../../shared/ui/components/AnimatedCounter';
import type { ExtendedRootStackParams } from '../../../navigation/types';
import { useTheme } from '../../../theme';
import { useWallet } from '../hooks';

type NavigationProp = NativeStackNavigationProp<ExtendedRootStackParams>;
type SimpleWalletBadgeProps = { userId: string; streak: number; onPress: () => void };

export function SimpleWalletBadge({ userId, streak, onPress }: SimpleWalletBadgeProps): JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const walletQuery = useWallet(userId);
  const sheetRef = useRef<BottomSheet>(null);
  const wallet = walletQuery.data;
  const coins = wallet?.coins ?? 0;
  const gems = wallet?.gems ?? 0;

  const handleOpen = () => {
    onPress();
    sheetRef.current?.snapToIndex(0);
  };

  return (
    <>
      {walletQuery.isLoading ? (
        <Skeleton width={110} height={38} borderRadius={999} />
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={handleOpen}
          style={{
            borderWidth: 1,
            borderColor: theme.colors.primary[500],
            borderRadius: 999,
            backgroundColor: 'theme.colors.background.primary',
            paddingHorizontal: theme.spacing[3],
            paddingVertical: theme.spacing[2],
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
          accessibilityLabel="Open wallet"
          accessibilityHint="Shows your coin and gem balance"
        >
          <Text variant="label" color={theme.colors.text.primary}>💰</Text>
          <AnimatedCounter value={coins} size="sm" color={theme.colors.text.primary} duration={600} />
          {streak >= 7 && (
            <>
              <Text variant="label" color={theme.colors.text.primary}>💎</Text>
              <AnimatedCounter value={gems} size="sm" color={theme.colors.text.primary} duration={600} />
            </>
          )}
        </Pressable>
      )}

      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={['45%']}
        enablePanDownToClose
        backdropComponent={(props) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />}
        backgroundStyle={{ backgroundColor: theme.colors.background.secondary, borderWidth: 1, borderColor: theme.colors.border.light }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.text.tertiary }}
      >
        <View style={{ flex: 1, paddingHorizontal: 24, paddingVertical: 12, gap: 16 }}>
          <Text variant="h3" color={theme.colors.text.primary}>How to earn coins</Text>
          {[
            '\u2705 Finish a 25m session \u2192 +50 coins',
            '\uD83D\uDD25 Maintain a 7-day streak \u2192 +200 coins',
            '\u2694\uFE0F Help defeat the weekly boss \u2192 +100 coins',
          ].map((tip) => (
            <View key={tip} style={{ borderWidth: 1, borderColor: theme.colors.border.light, borderRadius: theme.borderRadius.xl, backgroundColor: theme.colors.background.primary, padding: theme.spacing[3] }}>
              <Text variant="bodySmall" color={theme.colors.text.primary}>{tip}</Text>
            </View>
          ))}
          <Button
            fullWidth
            onPress={() => {
              sheetRef.current?.close();
              navigation.navigate('SessionStack', { screen: 'SessionSetup', params: {} });
            }}
            accessibilityLabel="Start a session button"
            accessibilityRole="button"
            accessibilityHint="Starts a new focus session"
          >
            Start a session
          </Button>
        </View>
      </BottomSheet>
    </>
  );
}
