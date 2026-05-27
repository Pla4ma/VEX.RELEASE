import React from "react";
import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import {
  DifficultySelector,
  type SessionDifficulty,
} from "../../../features/session-start/components/DifficultySelector";

type SessionSetupDifficultyCardProps = {
  disabled: boolean;
  selected: SessionDifficulty;
  selectedDurationSeconds: number;
  onChange: (difficulty: SessionDifficulty) => void;
};

function getMultiplier(difficulty: SessionDifficulty): number {
  if (difficulty === "CASUAL") {
    return 0.5;
  }
  if (difficulty === "DEEP_WORK") {
    return 1.5;
  }
  return 1;
}

function getBonusLabel(difficulty: SessionDifficulty): string {
  if (difficulty === "DEEP_WORK") {
    return "(1.5x Deep Work bonus)";
  }
  if (difficulty === "CASUAL") {
    return "(0.5x Casual)";
  }
  return "";
}

export function SessionSetupDifficultyCard({
  disabled,
  selected,
  selectedDurationSeconds,
  onChange,
}: SessionSetupDifficultyCardProps): React.JSX.Element {
  return (
    <Box px="lg" mt="md" mb="md">
      <Box mb="sm">
        <Text variant="label" color="text.secondary">
          Select Difficulty
        </Text>
        <Text variant="caption" color="text.tertiary">
          Estimated XP:{" "}
          {Math.round((selectedDurationSeconds / 60) * getMultiplier(selected))}{" "}
          {getBonusLabel(selected)}
        </Text>
      </Box>
      <DifficultySelector
        selected={selected}
        onChange={onChange}
        disabled={disabled}
      />
    </Box>
  );
}
