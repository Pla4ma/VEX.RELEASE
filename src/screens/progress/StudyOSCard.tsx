import React from 'react';
import { View } from 'react-native';
import { Button } from '../../components/primitives/Button';
import { Text } from '../../components/primitives/Text';
import { getPremiumCardStyle } from '../../components/premiumStyles';
import type { Theme } from '../../theme';

type StudyOSCardProps = {
  theme: Theme;
  canOpenStudy: boolean;
  onOpenStudy: () => void;
};

export function StudyOSCard({
  theme,
  canOpenStudy,
  onOpenStudy,
}: StudyOSCardProps): JSX.Element {
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        backgroundColor: theme.colors.background.secondary,
        padding: theme.spacing[4],
        gap: theme.spacing[3],
        ...getPremiumCardStyle('medium'),
      }}
    >
      <Text variant="label" color={theme.colors.text.secondary}>
        Study OS
      </Text>
      <Text variant="h4" color={theme.colors.text.primary}>
        {canOpenStudy
          ? 'Turn material into focus sessions'
          : 'Study tools unlock through sessions'}
      </Text>
      <Text variant="body" color={theme.colors.text.secondary}>
        Plans, review, and quizzes stay tied to the same start and complete
        loop.
      </Text>
      <Button
        variant="outline"
        onPress={onOpenStudy}
        accessibilityLabel={
          canOpenStudy
            ? 'Open study tools'
            : 'Start session to unlock study tools'
        }
        accessibilityRole="button"
        accessibilityHint="Moves you to the next study or focus action"
      >
        {canOpenStudy ? 'Open study tools' : 'Start session'}
      </Button>
    </View>
  );
}
