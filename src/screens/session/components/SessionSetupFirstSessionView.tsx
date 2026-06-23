import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Box } from '../../../components/primitives/Box';
import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import { SessionStartStatusCard } from '../../../features/session-start/components/SessionStartStatusCard';
import { SessionMode } from '../../../session/modes';
import type {
  ExtendedRootStackParams,
  SessionStackParams,
} from '../../../navigation/types';
import { ModeQuickContract } from '../../../features/mode-native/components/ModeQuickContract';
import { useFirstSessionPersonalization } from '../hooks/useFirstSessionPersonalization';
import { useFirstSessionStart } from '../hooks/useFirstSessionStart';
import { useAuthStore } from '../../../store';
import { useOnboardingStore } from '../../../features/onboarding/store';
import type { Lane } from '../../../features/lane-engine/types';
import { LiquidGlassScreen } from '../../../shared/ui/liquid-glass/LiquidGlassScreen';
import { Text as VexText } from '../../../components/primitives/Text';

type SessionNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<SessionStackParams>,
  NativeStackNavigationProp<ExtendedRootStackParams>
>;

const SESSION_MODE_TO_LANE: Record<string, Lane> = {
  [SessionMode.STUDY]: 'student',
  [SessionMode.LIGHT_FOCUS]: 'game_like',
  [SessionMode.DEEP_WORK]: 'deep_creative',
  [SessionMode.CREATIVE]: 'minimal_normal',
};

function sessionModeToLane(mode: SessionMode): Lane {
  return SESSION_MODE_TO_LANE[mode] ?? 'minimal_normal';
}

type FirstSessionViewProps = {
  navigation: SessionNavigationProp;
  onBack: () => void;
};

export function FirstSessionView({
  navigation,
  onBack,
}: FirstSessionViewProps): React.ReactNode {
  const personalization = useFirstSessionPersonalization();
  const { user } = useAuthStore();
  const userId = user?.id ?? '';
  const markFirstSessionStarted = useOnboardingStore(
    (s) => s.markFirstSessionStarted,
  );
  const [offlineMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const { handleFirstSessionStart, isStarting } = useFirstSessionStart({
    navigation,
    userId,
  });

  const lane = useMemo(
    () => sessionModeToLane(personalization.defaultMode),
    [personalization.defaultMode],
  );

  const handleContractAnswers = useCallback(
    (answers: Record<string, string>) => {
      markFirstSessionStarted();
      const goal = Object.values(answers).join(' — ');
      handleFirstSessionStart({
        mode: personalization.defaultMode,
        durationMinutes: personalization.suggestedDurationMinutes,
        goal,
      }).catch((err: unknown) => {
        if (!mountedRef.current) { return; }
        const message =
          err instanceof Error
            ? err.message
            : 'Unexpected session start failure';
        setError(message);
      });
    },
    [
      handleFirstSessionStart,
      markFirstSessionStarted,
      personalization.defaultMode,
      personalization.suggestedDurationMinutes,
    ],
  );

  if (!userId) {
    return (
      <Box
        flex={1}
        bg="background.primary"
        justifyContent="center"
        alignItems="center"
        p="lg"
      >
        <Text variant="h4" color="error.DEFAULT" mb="md">
          Not authenticated
        </Text>
        <Button variant="primary"
          onPress={onBack}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          accessibilityHint="Returns to the previous screen"
        >
          <VexText>Go Back</VexText>
        </Button>
      </Box>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <LiquidGlassScreen>
        <SessionStartStatusCard
          offlineMessage={offlineMessage}
          routeWarningMessage={null}
          startErrorMessage={error}
          onDismissStartError={() => setError(null)}
        />
        <ModeQuickContract
          lane={lane}
          isStarting={isStarting}
          onStart={handleContractAnswers}
          onBack={onBack}
        />
      </LiquidGlassScreen>
    </KeyboardAvoidingView>
  );
}
