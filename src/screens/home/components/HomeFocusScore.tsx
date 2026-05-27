/**
 * HomeFocusScore Component
 *
 * Renders the Focus Score widget in the Home screen.
 * Part of Phase 3 Information Architecture - position 1.
 */

import React from "react";
import { FocusScoreHomeWidget } from "../../../features/focus-identity/components/focus-score-home-widget";
import { useFocusScoreDashboardModel } from "../../../features/focus-identity/hooks-focus-score";
import { useAuthStore } from "../../../store";

interface HomeFocusScoreProps {
  onPress: () => void;
}

export function HomeFocusScore({ onPress }: HomeFocusScoreProps): JSX.Element {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const focusModel = useFocusScoreDashboardModel(userId, 30);

  return (
    <FocusScoreHomeWidget
      model={focusModel}
      onPress={onPress}
      onRetry={() => void focusModel.refetch()}
    />
  );
}
