import React from 'react';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { formatTime } from '../utils/active-session';
import type { ActiveSessionHeroViewModel } from '../utils/active-session-hero-view-model';

export function MomentumDots({
  viewModel,
  themeColors,
}: {
  viewModel: ActiveSessionHeroViewModel;
  themeColors: { success: string; warning: string; error: string };
}): React.JSX.Element | null {
  if (!viewModel.momentumScores) {
    return null;
  }
  const scores = viewModel.momentumScores;
  return (
    <Box
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      gap="sm"
      mt="lg"
    >
      {scores.length > 0 ? (
        scores.map((score, index) => (
          <Box
            key={`momentum-score-${index}`}
            width={8}
            height={8}
            borderRadius="full"
            style={{
              backgroundColor:
                score >= 70
                  ? themeColors.success
                  : score >= 45
                    ? themeColors.warning
                    : themeColors.error,
              opacity: 0.85 + ((index + 1) / scores.length) * 0.55,
            }}
          />
        ))
      ) : (
        <Text variant="caption" color="text.secondary">
          Calibrating momentum...
        </Text>
      )}
    </Box>
  );
}

export function DailyProgress({
  viewModel,
}: {
  viewModel: ActiveSessionHeroViewModel;
}): React.JSX.Element | null {
  if (
    viewModel.dailyProgress === null ||
    viewModel.todayFocusSeconds === null
  ) {
    return null;
  }
  return (
    <Text variant="caption" color="text.secondary" textAlign="center" mt="sm">
      {`${formatTime(viewModel.todayFocusSeconds)} today - ${Math.round(viewModel.dailyProgress)}% of 2h goal`}
    </Text>
  );
}

export function SessionStats({
  viewModel,
  labelColor,
}: {
  viewModel: ActiveSessionHeroViewModel;
  labelColor: string;
}): React.JSX.Element | null {
  if (viewModel.heroDensity === 'minimal') {
    return null;
  }
  return (
    <Box flexDirection="row" justifyContent="center" gap="xl" mt="xl">
      <Stat label="Elapsed" value={formatTime(viewModel.elapsedSeconds)} />
      <Stat
        label="Complete"
        value={`${Math.round(viewModel.completionPercentage)}%`}
        color={labelColor}
      />
    </Box>
  );
}

function Stat(props: {
  label: string;
  value: string;
  color?: string;
}): React.JSX.Element {
  return (
    <Box alignItems="center">
      <Text
        variant="h4"
        color={props.color ? undefined : 'text.primary'}
        style={props.color ? { color: props.color } : undefined}
      >
        {props.value}
      </Text>
      <Text variant="caption" color="text.secondary">
        {props.label}
      </Text>
    </Box>
  );
}
