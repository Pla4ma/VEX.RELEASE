import React, { useMemo } from 'react';
import { Share, useWindowDimensions, View } from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';

import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import type { SquadSummary } from '../schemas';
import {
  SquadShareCard,
  SQUAD_SHARE_CARD_WIDTH,
} from './SquadShareCard';

type WeeklyStats = {
  totalSessions: number;
  totalFocusMinutes: number;
  activeMemberCount: number;
};

type SquadShareSheetProps = {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  squad: SquadSummary | null;
  weeklyStats: WeeklyStats;
};

export function SquadShareSheet({
  bottomSheetRef,
  squad,
  weeklyStats,
}: SquadShareSheetProps): JSX.Element {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const snapPoints = useMemo(() => ['55%', '80%'], []);
  const previewScale = Math.min(1, (width - theme.spacing[10]) / SQUAD_SHARE_CARD_WIDTH);

  const handleShare = async () => {
    if (!squad) {
      return;
    }

    const squadCode = squad.id.slice(0, 8);
    await Share.share({
      message: `My squad ${squad.name} just hit ${Math.round(weeklyStats.totalFocusMinutes / 60)}h of focus this week on VEX. Join us 👊`,
      url: `https://vex.app/squad/${squadCode}`,
    });
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
      )}
      backgroundStyle={{
        backgroundColor: theme.colors.background.secondary,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
      }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.text.tertiary }}
    >
      <View
        style={{
          flex: 1,
          paddingHorizontal: theme.spacing[5],
          paddingVertical: theme.spacing[4],
          gap: theme.spacing[4],
        }}
      >
        <View style={{ gap: theme.spacing[2] }}>
          <Text variant="h4" color={theme.colors.text.primary}>
            Share your squad&apos;s momentum
          </Text>
          <Text variant="bodySmall" color={theme.colors.text.secondary}>
            Turn this week&apos;s focus into a quick invite your crew can rally around.
          </Text>
        </View>

        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          {squad ? (
            <View style={{ transform: [{ scale: previewScale }] }}>
              <SquadShareCard squad={squad} weeklyStats={weeklyStats} />
            </View>
          ) : null}
        </View>

        <Button onPress={() => void handleShare()} isDisabled={!squad}
  accessibilityLabel="Share This Week button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
          Share This Week
        </Button>
      </View>
    </BottomSheet>
  );
}
