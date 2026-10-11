import React, { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GlassScreen } from '../../components/glass/GlassScreen';
import { Text } from '../../components/primitives/Text';
import { useFocusScoreDashboardModel } from '../../features/focus-identity/hooks-focus-score';
import type { FocusModeCard } from '../../features/session-start/navigation-schemas';
import { buildFocusModeCards } from '../../features/session-start/service';
import { useStreakSummary } from '../../features/streaks/hooks';
import type { ExtendedRootStackParams } from '../../navigation/types';
import { navigateToMainStackScreen, navigateToSessionStackScreen } from '../../navigation/navigation-helpers';
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import { VexBackdrop } from '../../shared/ui/vex/VexBackdrop';
import { VexIcon } from '../../shared/ui/vex/VexIcon';
import { useAuthStore } from '../../store';
import { useTheme } from '../../theme/ThemeContext';
import { vexFire } from '../../theme/tokens/vex-fire';
import { getMinTouchTargetStyle } from '../../utils/touchTarget';
import { FocusModeRail } from './components/FocusModeRail';
import { FocusSignalHero } from './components/FocusSignalHero';

const FOCUS_BACKGROUND = require('../../../assets/vex/focus-background.png');
type NavigationProp = NativeStackNavigationProp<ExtendedRootStackParams>;

function FocusScreen(): React.JSX.Element {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const userId = useAuthStore((state) => state.user?.id ?? '');
  const streakQuery = useStreakSummary(userId || null);
  const focusModel = useFocusScoreDashboardModel(userId || null);
  const modeCards = useMemo(() => buildFocusModeCards({ streakDays: streakQuery.data?.currentDays ?? 0 }), [streakQuery.data?.currentDays]);
  const openMode = (card: FocusModeCard): void => navigateToSessionStackScreen(navigation, 'SessionSetup', { presetDuration: card.durationSeconds, presetMode: card.mode, sessionCategory: card.id });

  return (
    <GlassScreen showAura={false} variant="focus">
      <VexBackdrop source={FOCUS_BACKGROUND} overlayColor={vexFire.background} overlayOpacity={0.74} />
      <ScrollView contentContainerStyle={{ gap: theme.spacing[4], paddingBottom: theme.spacing[20], paddingHorizontal: theme.spacing[5], paddingTop: theme.spacing[3] }} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center', borderBottomColor: vexFire.line, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: theme.spacing[16], paddingBottom: theme.spacing[3] }}>
          <View style={{ alignItems: 'center', flexDirection: 'row', gap: theme.spacing[3] }}><View style={{ backgroundColor: vexFire.ember, borderRadius: theme.borderRadius.full, height: theme.spacing[2], width: theme.spacing[2] }} /><Text color={vexFire.cream} style={{ fontFamily: theme.fonts.display ?? theme.fonts.primary, fontSize: theme.typography.display.small.fontSize }} variant="h2">VEX</Text><Text color={vexFire.textMuted} variant="label" style={{ letterSpacing: 2.5 }}>FOCUS</Text></View>
          <Pressable accessibilityHint="Opens your VEX notifications" accessibilityLabel="Open notifications" accessibilityRole="button" onPress={() => navigateToMainStackScreen(navigation, 'Notifications')} style={({ pressed }) => ({ ...getMinTouchTargetStyle(), alignItems: 'center', borderColor: vexFire.borderStrong, borderRadius: theme.borderRadius.full, borderWidth: 1, justifyContent: 'center', opacity: pressed ? 0.78 : 1 })}><VexIcon color={vexFire.amber} name="bell" size="sm" variant="outline" /></Pressable>
        </View>
        <FocusSignalHero model={focusModel} />
        <FocusModeRail cards={modeCards} onPress={openMode} />
        {focusModel.isError ? <Pressable accessibilityHint="Try reading your focus score again" accessibilityLabel="Retry focus score" accessibilityRole="button" onPress={focusModel.refetch} style={{ alignItems: 'center', justifyContent: 'center', minHeight: theme.spacing[12] }}><Text color={vexFire.ember} variant="button">Recalibrate signal</Text></Pressable> : null}
      </ScrollView>
    </GlassScreen>
  );
}

const FocusScreenWithBoundary = withScreenErrorBoundary(FocusScreen, 'Focus');
export { FocusScreenWithBoundary as FocusScreen };
