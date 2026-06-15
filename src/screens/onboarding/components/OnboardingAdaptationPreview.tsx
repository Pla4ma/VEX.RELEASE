import React from 'react';
import { View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import type {
  FocusGoal,
  MotivationProfileType,
} from '../../../features/onboarding/schemas';
import { useTheme } from '../../../theme/ThemeContext';
import { styles } from '../styles';
import { buildOnboardingAdaptationPreview } from './onboarding-adaptation-preview';

type OnboardingAdaptationPreviewProps = {
  goal: FocusGoal | undefined;
  motivationStyle: MotivationProfileType | undefined;
};

export function OnboardingAdaptationPreview({
  goal,
  motivationStyle,
}: OnboardingAdaptationPreviewProps): React.ReactNode {
  const { theme } = useTheme();
  const preview = buildOnboardingAdaptationPreview({ goal, motivationStyle });

  return (
    <View
      style={[
        styles.choiceCard,
        {
          backgroundColor: theme.colors.background.secondary,
          borderColor: theme.colors.primary[500],
          marginTop: theme.spacing[4],
        },
      ]}
      accessibilityLabel={`${preview.sessionTitle} starter preview`}
      accessibilityRole="summary"
    >
      <Text style={[styles.choiceTitle, { color: theme.colors.text.primary }]}>
        {`${preview.sessionTitle} | ${preview.durationLabel}`}
      </Text>
      <Text
        style={[
          styles.choiceDescription,
          { color: theme.colors.text.secondary },
        ]}
      >
        {preview.coachTone}
      </Text>
      <Text
        style={[
          styles.choiceDescription,
          { color: theme.colors.text.secondary },
        ]}
      >
        {preview.rewardPreview}
      </Text>
    </View>
  );
}
