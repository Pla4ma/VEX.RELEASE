import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { GlassScreen } from '../../components/glass/GlassScreen';
import { Text } from '../../components/primitives/Text';
import { useFocusScoreDashboardModel } from '../../features/focus-identity/hooks-focus-score';
import { useAuthStore } from '../../store';
import { useFeatureAccess } from '../../features/liveops-config';
import type { ExtendedRootStackParams } from '../../navigation/types';
import { navigateToMainStackScreen, navigateToRootScreen } from '../../navigation/navigation-helpers';
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import { ProgressHeader } from './components/ProgressHeader';
import { PlanWorkspace } from '../plan/components/PlanWorkspace';
import { ProgressOverview } from './components/ProgressOverview';
import { useTheme } from '../../theme/ThemeContext';
import { VexBackdrop } from '../../shared/ui/vex/VexBackdrop';
import { vexFire } from '../../theme/tokens/vex-fire';
import { ProgressSignalHero } from './components/ProgressSignalHero';
import { ProgressWorldGrid } from './components/ProgressWorldGrid';

const PROGRESS_BACKGROUND = require('../../../assets/vex/progress-background.png');

type ProgressMode = 'overview' | 'plan';

function ProgressScreen(): React.JSX.Element {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<ExtendedRootStackParams>>();
  const disclosure = useFeatureAccess();
  const userId = useAuthStore((state) => state.user?.id ?? '');
  const focusModel = useFocusScoreDashboardModel(userId || null, 30);
  const [mode, setMode] = useState<ProgressMode>('overview');
  const completedSessions = disclosure.inputs.totalCompletedSessions;

  return (
    <GlassScreen showAura={false} variant="progress">
      <VexBackdrop source={PROGRESS_BACKGROUND} overlayColor={vexFire.background} overlayOpacity={0.76} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + theme.spacing[12], paddingHorizontal: theme.spacing[6], paddingTop: theme.spacing[4] }}
        showsVerticalScrollIndicator={false}
      >
        <ProgressHeader onOpenGuide={() => navigateToRootScreen(navigation, 'Guide')} onOpenNotifications={() => navigateToMainStackScreen(navigation, 'Notifications')} />
        <ProgressSignalHero completedSessions={completedSessions} model={focusModel} />
        <View style={{ borderBottomColor: vexFire.line, borderBottomWidth: 1, flexDirection: 'row', marginBottom: theme.spacing[5], paddingBottom: theme.spacing[1] }}>
          {(['overview', 'plan'] as const).map((item) => {
            const selected = mode === item;
            return (
              <Pressable
                accessibilityHint={item === 'overview' ? 'Show your focus record' : 'Show your current plan'}
                accessibilityLabel={`${item} tab`}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                key={item}
                onPress={() => setMode(item)}
                style={({ pressed }) => ({ alignItems: 'center', backgroundColor: selected ? vexFire.ember : 'transparent', borderRadius: selected ? theme.borderRadius.md : 0, flex: 1, justifyContent: 'center', minHeight: theme.spacing[10] + theme.spacing[1], opacity: pressed ? 0.8 : 1 })}
              >
                <Text style={{ color: selected ? vexFire.background : vexFire.textMuted, fontWeight: theme.fontWeights.bold, textTransform: 'uppercase', letterSpacing: 1.4 }} variant="label">{item}</Text>
              </Pressable>
            );
          })}
        </View>
        {mode === 'overview' ? (
          <>
            <ProgressOverview completedSessions={completedSessions} focusModel={focusModel} />
            <ProgressWorldGrid navigation={navigation} />
          </>
        ) : <PlanWorkspace />}
      </ScrollView>
    </GlassScreen>
  );
}

const ProgressScreenWithBoundary = withScreenErrorBoundary(ProgressScreen, 'Progress');
export { ProgressScreenWithBoundary as ProgressScreen };
