/**
 * FocusScreen
 *
 * The Focus tab provides access to:
 * - Starting focus sessions
 * - AI Study plans
 * - Quick session setup
 *
 * This is the launch-structure replacement for the old Start tab.
 */

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Text } from '../../components/primitives/Text';
import { Button } from '../../components/primitives/Button';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store';
import { useFeatureAccess } from '../../features/liveops-config';
import { useActiveStudyPlan } from '../../features/content-study/hooks';
import { createSheet } from '@/shared/ui/create-sheet';
import type { ExtendedRootStackParams } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<ExtendedRootStackParams>;

export function FocusScreen(): JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const userId = useAuthStore((state) => state.user?.id ?? '');
  const disclosure = useFeatureAccess();
  const studyPlanQuery = useActiveStudyPlan();

  const hasActiveStudyPlan = Boolean(studyPlanQuery.data);
  const canAccessContentStudy = disclosure.features.content_study.isVisible || hasActiveStudyPlan;

  const handleStartSession = () => {
    navigation.navigate('SessionStack', {
      screen: 'SessionSetup',
      params: {},
    });
  };

  const handleStartStudySession = () => {
    if (studyPlanQuery.data?.generationId) {
      navigation.navigate('SessionStack', {
        screen: 'SessionSetup',
        params: {
          studyPlanId: studyPlanQuery.data.generationId,
          source: 'content-study',
        },
      });
    }
  };

  const handleContentStudy = () => {
    navigation.navigate('ContentStudy');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background.primary }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text variant="h1" color={theme.colors.text.primary}>
          Focus
        </Text>
        <Text variant="body" color={theme.colors.text.secondary}>
          Choose how you want to focus today
        </Text>
      </View>

      {/* Primary Action: Start Focus Session */}
      <View style={[styles.card, { backgroundColor: theme.colors.background.secondary }]}>
        <Text variant="h3" color={theme.colors.text.primary}>
          Start Focus Session
        </Text>
        <Text variant="bodySmall" color={theme.colors.text.secondary} style={styles.cardDescription}>
          Begin a timed focus session with your chosen settings
        </Text>
        <Button
          variant="primary"
          size="lg"
          onPress={handleStartSession}
          style={styles.actionButton}
        >
          Start Session
        </Button>
      </View>

      {/* AI Study Section - Always visible but with different states */}
      <View style={[styles.card, { backgroundColor: theme.colors.background.secondary }]}>
        <View style={styles.cardHeader}>
          <Text variant="h3" color={theme.colors.text.primary}>
            AI Study
          </Text>
          {hasActiveStudyPlan && (
            <View style={[styles.badge, { backgroundColor: theme.colors.info.DEFAULT }]}>
              <Text variant="caption" color="text.inverse" fontSize={10}>
                Active
              </Text>
            </View>
          )}
        </View>
        <Text variant="bodySmall" color={theme.colors.text.secondary} style={styles.cardDescription}>
          {hasActiveStudyPlan
            ? `Continue studying: ${studyPlanQuery.data?.title || 'Your plan'}`
            : 'Upload notes, paste content, or share a link. Gemini will create a personalized study plan with focused sessions.'}
        </Text>

        {hasActiveStudyPlan ? (
          <View style={styles.buttonRow}>
            <Button
              variant="secondary"
              size="md"
              onPress={handleStartStudySession}
            >
              Continue Study
            </Button>
            <Button
              variant="ghost"
              size="md"
              onPress={handleContentStudy}
            >
              New Study
            </Button>
          </View>
        ) : (
          <View style={styles.studyPromo}>
            <View style={styles.studyFeatures}>
              <Text variant="caption" color={theme.colors.text.tertiary}>📄 PDFs & Notes</Text>
              <Text variant="caption" color={theme.colors.text.tertiary}>🔗 YouTube Videos</Text>
              <Text variant="caption" color={theme.colors.text.tertiary}>📝 Any Text</Text>
            </View>
            <Button
              variant="secondary"
              size="lg"
              onPress={handleContentStudy}
              style={styles.actionButton}
            >
              Create Study Plan
            </Button>
          </View>
        )}
      </View>

      {/* Quick Presets */}
      <View style={[styles.card, { backgroundColor: theme.colors.background.secondary }]}>
        <Text variant="h3" color={theme.colors.text.primary}>
          Quick Start
        </Text>
        <View style={styles.presetRow}>
          <Button
            variant="outline"
            size="sm"
            onPress={() => navigation.navigate('SessionStack', {
              screen: 'SessionSetup',
              params: { presetDuration: 25 * 60, presetMode: 'LIGHT_FOCUS' },
            })}
          >
            25 min
          </Button>
          <Button
            variant="outline"
            size="sm"
            onPress={() => navigation.navigate('SessionStack', {
              screen: 'SessionSetup',
              params: { presetDuration: 45 * 60, presetMode: 'DEEP_WORK' },
            })}
          >
            45 min
          </Button>
          <Button
            variant="outline"
            size="sm"
            onPress={() => navigation.navigate('SessionStack', {
              screen: 'SessionSetup',
              params: { presetDuration: 60 * 60, presetMode: 'DEEP_WORK' },
            })}
          >
            60 min
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = createSheet({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  header: {
    marginBottom: 8,
    gap: 4,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardDescription: {
    marginTop: 4,
  },
  actionButton: {
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  studyPromo: {
    gap: 12,
  },
  studyFeatures: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
});

export default FocusScreen;
