import React, { useCallback } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '../../components/primitives/Box';
import { Text } from '../../components/primitives/Text';
import { useTheme } from '../../theme';
import { useOnboardingStore } from '../../features/onboarding/store';
import type { Lane } from '../../features/lane-engine';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SettingsStackParams } from '../../navigation';
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import { LANE_LABELS, LANE_EMOJI } from '../onboarding/components/LaneConfirmationStep';

type Props = NativeStackScreenProps<SettingsStackParams, 'LaneMode'>;

const ALL_LANES: Lane[] = ['student', 'game_like', 'deep_creative', 'minimal_normal'];

const LANE_DESCRIPTIONS: Record<Lane, string> = {
  student: 'Recall cards, deadline tracking, and learning sessions. Best for students and learners.',
  game_like: 'Visible momentum, energetic goals, and quick rewards. Turns focus into progress.',
  deep_creative: 'Continuity for deeper work, flow windows, and project memory. For long-form creativity.',
  minimal_normal: 'Clean sessions, quiet progress, low notifications. Minimal and calm.',
};

export const LaneModeSettingsScreen = withScreenErrorBoundary(
  function _LaneModeSettingsScreen({ navigation }: Props): JSX.Element {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const chosenLane = useOnboardingStore((s: { chosenLane: Lane | null }) => s.chosenLane);
  const setChosenLane = useOnboardingStore((s: { setChosenLane: (lane: Lane | null) => void }) => s.setChosenLane);

  const handleSelectLane = useCallback(
    (lane: Lane): void => {
      setChosenLane(lane);
      navigation.goBack();
    },
    [setChosenLane, navigation],
  );

  return (
    <Box flex={1} style={{ backgroundColor: theme.colors.background.primary }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Box px={20} pb={16} pt={insets.top + 16}>
          <Text variant="h1">Focus Mode</Text>
          <Text variant="body" color="text.secondary" style={{ marginTop: 8 }}>
            Choose how VEX tailors your home screen and coach experience.
            You can change this anytime.
          </Text>
        </Box>

        <Box px={16} gap={12}>
          {ALL_LANES.map((lane) => {
            const isSelected = chosenLane === lane;
            return (
              <Pressable
                key={lane}
                onPress={() => handleSelectLane(lane)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 16,
                  borderRadius: 16,
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? theme.colors.primary[500] : theme.colors.border.DEFAULT,
                  backgroundColor: isSelected
                    ? `${theme.colors.primary[500]}10`
                    : theme.colors.background.secondary,
                  gap: 12,
                }}
                accessibilityLabel={`Select ${LANE_LABELS[lane]}`}
                accessibilityRole="button"
                accessibilityHint={`Changes your focus mode to ${LANE_LABELS[lane]}`}
              >
                <Text style={{ fontSize: 32 }}>{LANE_EMOJI[lane]}</Text>
                <View style={{ flex: 1 }}>
                  <Text variant="body" style={{ fontWeight: '600', color: theme.colors.text.primary }}>
                    {LANE_LABELS[lane]}
                  </Text>
                  <Text
                    variant="caption"
                    color="text.secondary"
                    style={{ marginTop: 4, lineHeight: 18 }}
                  >
                    {LANE_DESCRIPTIONS[lane]}
                  </Text>
                </View>
                {isSelected && (
                  <Box
                    width={24}
                    height={24}
                    borderRadius={12}
                    justifyContent="center"
                    alignItems="center"
                    style={{ backgroundColor: theme.colors.primary[500] }}
                  >
                    <Text style={{ color: '#fff', fontSize: 14 }}>{'\u2713'}</Text>
                  </Box>
                )}
              </Pressable>
            );
          })}
        </Box>

        <Box height={insets.bottom + 40} />
      </ScrollView>
    </Box>
  );
}, 'LaneMode');

export default LaneModeSettingsScreen;
