import React from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { SmartCoachHint } from '../../components/coach/SmartCoachHint';
import { AppScreen, Button, Card, Text } from '../../components/primitives';
import { useFeatureAccess } from '../../features/liveops-config';
import { useActiveStudyPlan } from '../../features/content-study/hooks';
import { useTheme } from '../../theme';
import type { ExtendedRootStackParams } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<ExtendedRootStackParams>;

export function FocusScreen(): JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const disclosure = useFeatureAccess();
  const studyPlanQuery = useActiveStudyPlan();
  const hasActiveStudyPlan = Boolean(studyPlanQuery.data);
  const canAccessContentStudy = disclosure.features.content_study.isVisible || hasActiveStudyPlan;

  const openSession = (duration?: number, mode?: 'LIGHT_FOCUS' | 'DEEP_WORK'): void => {
    navigation.navigate('SessionStack', {
      screen: 'SessionSetup',
      params: duration && mode ? { presetDuration: duration, presetMode: mode } : {},
    });
  };
  const handleStartStudySession = (): void => {
    if (!studyPlanQuery.data?.generationId) {
      return;
    }
    navigation.navigate('SessionStack', {
      screen: 'SessionSetup',
      params: { source: 'content-study', studyPlanId: studyPlanQuery.data.generationId },
    });
  };

  return (
    <AppScreen contentStyle={{ gap: theme.spacing[4] }}>
      <View style={{ gap: theme.spacing[1], marginBottom: theme.spacing[2] }}>
        <Text color="primary.300" variant="label">Focus launcher</Text>
        <Text color="text.primary" variant="h1">Focus</Text>
        <Text color="text.secondary" variant="body">Choose a calm, high-leverage path into the next session.</Text>
      </View>

      <SmartCoachHint
        actionLabel={hasActiveStudyPlan ? 'Continue Study Plan' : 'Build Study Plan'}
        body={hasActiveStudyPlan
          ? 'Your next best move is ready. I can route you straight into a study-backed focus session.'
          : 'Start with notes, a PDF, or a video link and I will turn it into a guided focus path.'}
        mood={hasActiveStudyPlan ? 'celebrate' : 'active'}
        onAction={hasActiveStudyPlan ? handleStartStudySession : () => navigation.navigate('ContentStudy')}
        title={hasActiveStudyPlan ? 'Study mode is primed' : 'Need direction? I can build the plan.'}
      />

      <Card size="lg" variant="premium">
        <Text color="text.primary" variant="h3">Start Focus Session</Text>
        <Text color="text.secondary" mb="md" mt="xs" variant="bodySmall">
          Begin a timed focus session with your chosen stakes, mode, and companion support.
        </Text>
        <Button fullWidth onPress={() => openSession()} size="lg" variant="primary">Start Session</Button>
      </Card>

      <Card size="lg" variant="glass">
        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text color="text.primary" variant="h3">AI Study</Text>
          {hasActiveStudyPlan ? (
            <View style={{ backgroundColor: theme.colors.semantic.info, borderRadius: theme.borderRadius.full, paddingHorizontal: theme.spacing[3], paddingVertical: theme.spacing[1] }}>
              <Text color="text.inverse" fontSize={10} variant="caption">Active</Text>
            </View>
          ) : null}
        </View>
        <Text color="text.secondary" mt="xs" variant="bodySmall">
          {hasActiveStudyPlan
            ? `Continue studying: ${studyPlanQuery.data?.title || 'Your plan'}`
            : 'Turn notes, videos, or pasted content into a focused study plan.'}
        </Text>
        {hasActiveStudyPlan ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[3], marginTop: theme.spacing[4] }}>
            <Button onPress={handleStartStudySession} variant="secondary">Continue Study</Button>
            <Button onPress={() => navigation.navigate('ContentStudy')} variant="ghost">New Study</Button>
          </View>
        ) : (
          <View style={{ gap: theme.spacing[3], marginTop: theme.spacing[4] }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[3] }}>
              <Text color="text.muted" variant="caption">PDFs & notes</Text>
              <Text color="text.muted" variant="caption">Video links</Text>
              <Text color="text.muted" variant="caption">Any text</Text>
            </View>
            <Button
              fullWidth
              isDisabled={!canAccessContentStudy}
              onPress={() => navigation.navigate('ContentStudy')}
              size="lg"
              variant="secondary"
            >
              Create Study Plan
            </Button>
          </View>
        )}
      </Card>

      <Card size="lg" variant="default">
        <Text color="text.primary" variant="h3">Quick Start</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2], marginTop: theme.spacing[4] }}>
          <Button onPress={() => openSession(25 * 60, 'LIGHT_FOCUS')} size="sm" variant="outline">25 min</Button>
          <Button onPress={() => openSession(45 * 60, 'DEEP_WORK')} size="sm" variant="outline">45 min</Button>
          <Button onPress={() => openSession(60 * 60, 'DEEP_WORK')} size="sm" variant="outline">60 min</Button>
        </View>
      </Card>

      <Card size="lg" variant="glass">
        <Text color="text.primary" variant="h3">Command grid</Text>
        <Text color="text.secondary" mt="xs" variant="bodySmall">
          Jump into the connected systems that were previously buried behind menus.
        </Text>
        <View style={{ gap: theme.spacing[3], marginTop: theme.spacing[4] }}>
          <Button fullWidth onPress={() => navigation.navigate('AICoach')} variant="outline">Open AI Coach</Button>
          <Button fullWidth onPress={() => navigation.navigate('Challenges')} variant="outline">Daily Challenges</Button>
          <Button fullWidth onPress={() => navigation.navigate('ContentStudy')} variant="outline">AI Study Lab</Button>
        </View>
      </Card>
    </AppScreen>
  );
}

export default FocusScreen;
