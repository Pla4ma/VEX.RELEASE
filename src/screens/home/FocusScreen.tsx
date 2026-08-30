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
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import { VexBackdrop } from '../../shared/ui/vex/VexBackdrop';
import { VexIcon } from '../../shared/ui/vex/VexIcon';
import { useAuthStore } from '../../store';
import { FocusModeCardView } from './components/FocusModeCardView';
import { useTheme } from '../../theme/ThemeContext';
import { getMinTouchTargetStyle } from '../../utils/touchTarget';

const FOCUS_BACKGROUND = require('../../../assets/vex/focus-background.png');

type NavigationProp = NativeStackNavigationProp<ExtendedRootStackParams>;

function FocusScreen(): React.JSX.Element {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const userId = useAuthStore((state) => state.user?.id ?? '');
  const streakQuery = useStreakSummary(userId || null);
  const focusScoreModel = useFocusScoreDashboardModel(userId || null);
  const modeCards = useMemo(
    () => buildFocusModeCards({ streakDays: streakQuery.data?.currentDays ?? 0 }),
    [streakQuery.data?.currentDays],
  );
  const openMode = (card: FocusModeCard): void => {
    navigation.navigate({
      name: 'SessionStack',
      params: {
        screen: 'SessionSetup',
        params: {
          presetDuration: card.durationSeconds,
          presetMode: card.mode,
          sessionCategory: card.id,
        },
      },
    });
  };

  return (
    <GlassScreen showAura={false} variant="focus">
      <VexBackdrop source={FOCUS_BACKGROUND} />
      <ScrollView
        contentContainerStyle={{
          paddingBottom: theme.spacing[20],
          paddingHorizontal: theme.spacing[6],
          paddingTop: theme.spacing[4],
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: 'center', borderBottomColor: theme.colors.border.light, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: theme.spacing[16], paddingBottom: theme.spacing[4] }}>
          <View style={{ alignItems: 'center', flexDirection: 'row', gap: theme.spacing[6] }}>
            <Text style={{ color: theme.colors.semantic.primary, fontFamily: theme.fonts.display ?? theme.fonts.primary, fontSize: theme.typography.display.small.fontSize, lineHeight: theme.typography.display.small.lineHeight }}>VEX</Text>
            <Text color="text.tertiary" variant="label" style={{ letterSpacing: 3 }}>Focus</Text>
          </View>
          <Pressable
            accessibilityHint="Opens your VEX notifications"
            accessibilityLabel="Open notifications"
            accessibilityRole="button"
            onPress={() => navigation.navigate('Notifications')}
            style={({ pressed }) => ({ alignItems: 'center', borderColor: theme.colors.border.DEFAULT, borderRadius: theme.borderRadius.full, borderWidth: 1, justifyContent: 'center', opacity: pressed ? theme.opacity[80] : theme.opacity[100], ...getMinTouchTargetStyle(), height: theme.spacing[12], width: theme.spacing[12] })}
          >
            <VexIcon color={theme.colors.semantic.primary} name="user" size="sm" variant="outline" />
          </Pressable>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing[8], minHeight: theme.spacing[24] }}>
          <View style={{ flex: 1, paddingRight: theme.spacing[4] }}>
            <Text color="text.tertiary" variant="label" style={{ letterSpacing: 3, marginBottom: theme.spacing[5] }}>September 2026</Text>
            <Text style={{ color: theme.colors.text.primary, fontFamily: theme.fonts.display ?? theme.fonts.primary, fontSize: theme.typography.display.medium.fontSize, lineHeight: theme.typography.display.medium.lineHeight }}>Set your intent.{`\n`}<Text style={{ color: theme.colors.text.tertiary, fontFamily: theme.fonts.display ?? theme.fonts.primary, fontSize: theme.typography.display.small.fontSize, lineHeight: theme.typography.display.small.lineHeight }}>Protect your edge.</Text></Text>
          </View>
          <View style={{ alignItems: 'flex-end', justifyContent: 'flex-end', paddingBottom: theme.spacing[2], width: theme.spacing[24] }}>
            <Text color={theme.colors.semantic.primary} variant="label" style={{ letterSpacing: 2, marginBottom: theme.spacing[1] }}>VEX Core</Text>
            <Text style={{ color: theme.colors.semantic.primary, fontFamily: theme.fonts.display ?? theme.fonts.primary, fontSize: theme.typography.display.medium.fontSize, lineHeight: theme.typography.display.medium.lineHeight }}>{focusScoreModel.isPending ? '…' : focusScoreModel.isError ? '—' : focusScoreModel.current ? Math.round(focusScoreModel.current.currentScore / 10) : 78}</Text>
            <Text color={theme.colors.text.primary} variant="label" style={{ letterSpacing: 2, marginTop: theme.spacing[1] }}>{focusScoreModel.isError ? 'SIGNAL PAUSED' : 'Focused'}</Text>
            <View style={{ backgroundColor: theme.colors.border.DEFAULT, height: 1, marginVertical: theme.spacing[4], width: theme.spacing[20] }} />
            <Text color="text.tertiary" variant="bodySmall">{focusScoreModel.isOffline ? 'Cached signal' : 'Stable'}</Text>
            <Text color="text.tertiary" variant="caption" style={{ marginTop: theme.spacing[1] }}>{focusScoreModel.current ? `${focusScoreModel.current.previousScore < focusScoreModel.current.currentScore ? '+' : ''}${Math.round((focusScoreModel.current.currentScore - focusScoreModel.current.previousScore) / 10)} from yesterday` : '+6 from yesterday'}</Text>
          </View>
        </View>

        <View style={{ height: theme.spacing[16] }} />
        {modeCards.map((card) => <FocusModeCardView card={card} key={card.id} onPress={() => openMode(card)} />)}
        {focusScoreModel.isError ? <Pressable accessibilityHint="Try reading your focus score again" accessibilityLabel="Retry focus score" accessibilityRole="button" onPress={focusScoreModel.refetch} style={{ alignItems: 'center', justifyContent: 'center', marginTop: theme.spacing[4], minHeight: theme.spacing[12] }}><Text color={theme.colors.semantic.primary} variant="button">Try again</Text></Pressable> : null}
      </ScrollView>
    </GlassScreen>
  );
}

const FocusScreenWithBoundary = withScreenErrorBoundary(FocusScreen, 'Focus');
export { FocusScreenWithBoundary as FocusScreen };
