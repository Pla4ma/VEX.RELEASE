import React from "react";
import { Box } from "../../../components/primitives/Box";
import { StudyPlanSuggestionCard } from "../../../features/content-study/components/StudyPlanSuggestionCard";
import type { ActiveStudyPlan } from "../../../features/content-study/hooks";
import type { LearningExecutionCopy } from "../../../features/learning-execution";

type SessionSetupStudyPlanCardProps = {
  copy: LearningExecutionCopy;
  studyPlan: ActiveStudyPlan | null;
  onSelect: (studyPlan: ActiveStudyPlan) => void;
};

export function SessionSetupStudyPlanCard({
  copy,
  studyPlan,
  onSelect,
}: SessionSetupStudyPlanCardProps): React.JSX.Element | null {
  if (!studyPlan) {
    return null;
  }

  return (
    <Box px="lg" mt="md">
      <StudyPlanSuggestionCard
        copy={copy}
        studyPlan={studyPlan}
        onSelect={onSelect}
      />
    </Box>
  );
}
