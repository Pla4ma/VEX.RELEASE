import { SessionMode } from "../../../session/modes";
import type { PresetWithIcon } from "../utils/session-setup";
import type { SessionSetupParams, SessionContextResult } from "./sessionFlowTypes";

export function buildSessionContext(
  params: SessionSetupParams | undefined,
  selectedPreset: PresetWithIcon,
  selectedSessionMode: SessionMode,
  draftGoal: string | undefined,
  selectedThemeId: string,
  selectedThemeOwned: boolean,
): SessionContextResult {
  const sessionTags = Array.from(
    new Set([
      ...(selectedPreset.tags || []),
      ...(params?.sessionTags ?? []),
    ]),
  );
  const notesPayload: Record<string, unknown> = {};

  if (
    params?.source === "content-study" ||
    params?.source === "learning-execution"
  ) {
    if (!sessionTags.includes("content-study")) {
      sessionTags.push("content-study");
    }
    if (
      params.source === "learning-execution" &&
      !sessionTags.includes("learning-execution")
    ) {
      sessionTags.push("learning-execution");
    }
    if (params.studyPlanId && !sessionTags.includes(params.studyPlanId)) {
      sessionTags.push(params.studyPlanId);
    }
    if (params.focusAreas && params.focusAreas.length > 0) {
      sessionTags.push(...params.focusAreas.slice(0, 3));
    }

    notesPayload.source = params.source;
    notesPayload.generationId = params.generationId;
    notesPayload.contentId = params.contentId;
    notesPayload.studyPlanId = params.studyPlanId ?? params.generationId;
    notesPayload.focusAreas = params.focusAreas;
    notesPayload.learningExecutionLabel = params.learningExecutionLabel;
    notesPayload.learningExecutionTaskId = params.learningExecutionTaskId;
  }

  if (selectedThemeId && selectedThemeOwned) {
    notesPayload.selectedThemeId = selectedThemeId;
  }

  if (selectedSessionMode === SessionMode.STUDY && draftGoal?.trim()) {
    notesPayload.studyTarget = draftGoal.trim();
  }

  if (params?.comebackMultiplier && params.comebackMultiplier > 1) {
    if (!sessionTags.includes("comeback-session")) {
      sessionTags.push("comeback-session");
    }
    notesPayload.comebackMultiplier = params.comebackMultiplier;
    notesPayload.comebackMessage = params.comebackMessage;
  }

  if (params?.comebackQuest) {
    if (!sessionTags.includes("streak-restore-quest")) {
      sessionTags.push("streak-restore-quest");
    }
    notesPayload.comebackQuest = params.comebackQuest;
  }

  return { sessionTags, notesPayload };
}
