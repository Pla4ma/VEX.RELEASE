import React, { useCallback } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { lightColors } from '@/theme/tokens/colors';

import { Box } from '../../components/primitives/Box';
import { Text } from '../../components/primitives/Text';
import { useTheme } from '../../theme/ThemeContext';
import { useOnboardingStore } from '../../features/onboarding/store';
import type { Lane } from '../../features/lane-engine';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SettingsStackParams } from '../../navigation';
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import {
  LANE_LABELS,
  LANE_EMOJI,
} from '../onboarding/components/LaneConfirmationStep';
import {
  LiquidGlassHeader,
  liquidGlassSpacing,
} from '../../shared/ui/liquid-glass/LiquidGlassHeader';
import { LiquidGlassScreen } from '../../shared/ui/liquid-glass/LiquidGlassScreen';

type Props = NativeStackScreenProps<SettingsStackParams, 'LaneMode'>;

                
const ALL_LANES: Lane[] = [
  'student',
  'game_like',
  'deep_creative',
  'minimal_normal',
];

const LANE_DESCRIPTIONS: Record<Lane, string> = {
  student:
    'Recall cards, deadline tracking, and learning sessions. Best for students and learners.',
  game_like:
    'Visible momentum, energetic goals, and quick rewards. Turns focus into progress.',
  deep_creative:
    'Continuity for deeper work, flow windows, and project memory. For long-form creativity.',
  minimal_normal:
    'Clean sessions, quiet progress, low notifications. Minimal and calm.',
};

export const LaneModeSettingsScreen = withScreenErrorBoundary(
  function LaneModeSettingsScreen({ navigation }: Props): React.ReactNode {
    const { theme } = useTheme();

    const insets = useSafeAreaInsets();
    const chosenLane = useOnboardingStore(
      (s: { chosenLane: Lane | null }) => s.chosenLane,
    );
    const setChosenLane = useOnboardingStore(
      (s: { setChosenLane: (lane: Lane | null) => void }) => s.setChosenLane,
    );

    const handleSelectLane = useCallback(
      (lane: Lane): void => {
        setChosenLane(lane);
        navigation.goBack();
      },
      [setChosenLane, navigation],
    );

    return (
      <LiquidGlassScreen>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Box
            px={liquidGlassSpacing.screenX}
            pb={16}
            pt={insets.top + liquidGlassSpacing.screenTop}
          >
            <LiquidGlassHeader
              eyebrow="Lane"
              title="Focus Mode"
              body="Choose how VEX tailors your home and coach experience."
            />
          </Box>

          <Box px={16} gap={12}>
            {ALL_LANES.map((lane) => {
              const isSelected = chosenLane === lane;
              return (
                <Pressable
                  key={lane}
                  onPress={() => handleSelectLane(lane)}
                  style={{}}
                  accessibilityLabel={`Select ${LANE_LABELS[lane]}`}
                  accessibilityRole="button"
                  accessibilityHint={`Changes your focus mode to ${LANE_LABELS[lane]}`}
                >
                  <Text style={{ fontSize: 32 }}>{LANE_EMOJI[lane]}</Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      variant="body"
                      style={{
                        fontWeight: '600',
                        color: theme.colors.text.primary,
                      }}
                    >
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
                      <Text style={{ color: lightColors.text.inverse, fontSize: 14 }}>
                        {'\u2713'}
                      </Text>
                    </Box>
                  )}
                </Pressable>
              );
            })}
          </Box>

          <Box height={insets.bottom + 40} />
        </ScrollView>
      </LiquidGlassScreen>
    );
  },
  'LaneMode',
);

export default LaneModeSettingsScreen;
