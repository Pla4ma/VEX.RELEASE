import { useEffect, useMemo, useRef, useState } from 'react';
import {
  shouldAutoApplySmartSuggestion,
  shouldOpenCustomizationByDefault,
} from '../../../features/session-start/service';
import type { MasteryState } from '../../../features/mastery/types';
import type { SessionStackParams } from '../../../navigation/types';
import { getDefaultStorageAdapter } from '../../../persistence/MMKVStorageAdapter';
import { SessionMode, resolveSessionMode } from '../../../session/modes';
import { PRESETS, type PresetWithIcon, type SmartSuggestion } from '../utils/session-setup';
import {
  restoreSessionDraft,
  saveSessionDraft,
} from './session-setup-hydration';

type SessionSetupParams = SessionStackParams['SessionSetup'];

// Lazy-initialized state defaults to avoid recomputing on every render
function resolveInitialPreset(params: SessionSetupParams | undefined): PresetWithIcon {
  if (params?.presetId) {
    return (
      PRESETS.find((preset) => preset.id === params.presetId) ?? PRESETS[1]!
    );
  }
  return PRESETS[1]!;
}

function resolveInitialDuration(params: SessionSetupParams | undefined): number {
  return params?.presetDuration
    ? Math.max(1, Math.round(params.presetDuration / 60))
    : 30;
}

function resolveInitialSessionMode(params: SessionSetupParams | undefined): SessionMode {
  return params?.presetMode
    ? resolveSessionMode(params.presetMode)
    : params?.source === 'content-study'
      ? SessionMode.STUDY
      : SessionMode.LIGHT_FOCUS;
}

export function useSessionSetupState(
  userId: string,
  params: SessionSetupParams | undefined,
  currentStreak: number,
) {
  const storage = useMemo(() => getDefaultStorageAdapter(), []);
  const sessionDraftKey = `session_draft_${userId}`;
  const masteryStateKey = `mastery_state_${userId}`;
  const initialPreset = useMemo(() => resolveInitialPreset(params), [params?.presetId]);
  const [selectedPreset, setSelectedPreset] = useState<PresetWithIcon>(
    initialPreset!, // ponytail: initialPreset always set by useMemo
  );
  const [selectedCategory, setSelectedCategory] = useState(
    initialPreset?.category ?? 'standard',
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customDuration, setCustomDuration] = useState(
    () => resolveInitialDuration(params),
  );
  const [draftGoal, setDraftGoal] = useState(params?.goal);
  const [selectedThemeId, setSelectedThemeId] = useState(
    params?.selectedThemeId ?? 'default',
  );
  const [selectedSessionMode, setSelectedSessionMode] = useState<SessionMode>(
    () => resolveInitialSessionMode(params),
  );
  const [showCustomization, setShowCustomization] = useState(
    () => shouldOpenCustomizationByDefault(params ?? {}),
  );
  const [hasHydratedDraft, setHasHydratedDraft] = useState(false);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [hasAutoAppliedSuggestion, setHasAutoAppliedSuggestion] =
    useState(false);
  const [masteryState, setMasteryState] = useState<MasteryState | null>(null);
  const [smartSuggestion, setSmartSuggestion] =
    useState<SmartSuggestion | null>(null);

  // SAFETY: params changes require synchronizing derived UI selections;
  // this effect is the single source of truth for parameter-drive state.
  useEffect(() => {
    if (params?.presetId) {
      const matchedPreset = PRESETS.find(
        (preset) => preset.id === params.presetId,
      );
      if (matchedPreset) {
        setSelectedPreset(matchedPreset);
        setSelectedCategory(matchedPreset.category ?? 'standard');
      }
    }
    if (params?.selectedThemeId) {
      setSelectedThemeId(params.selectedThemeId);
    }
    if (params?.goal) {
      setDraftGoal(params.goal);
    }
    const routedDurationSeconds =
      params?.presetDuration ?? params?.suggestedDurationSeconds;
    if (routedDurationSeconds) {
      setSelectedPreset(PRESETS[5]!);
      setSelectedCategory('custom');
      setCustomDuration(Math.max(1, Math.round(routedDurationSeconds / 60)));
    }
    if (params?.presetMode) {
      setSelectedSessionMode(resolveSessionMode(params.presetMode));
    }
  }, [params?.goal, params?.presetDuration, params?.presetId, params?.presetMode, params?.selectedThemeId, params?.suggestedDurationSeconds]);

  // SAFETY: restoreSessionDraft performs async I/O (storage reads + master state fetch);
  // must run as effect triggered by user/session identity changes.
  useEffect(() => {
    let isCancelled = false;
    const run = async () => {
      const result = await restoreSessionDraft(
        storage,
        sessionDraftKey,
        masteryStateKey,
        userId,
        currentStreak,
        params,
      );
      if (isCancelled) {return;}
      setMasteryState(result.masteryState);
      setSmartSuggestion(result.smartSuggestion);
      setHasSavedDraft(result.hasSavedDraft);
      if (result.presetOverride) {setSelectedPreset(result.presetOverride);}
      if (result.categoryOverride) {setSelectedCategory(result.categoryOverride);}
      if (result.customDurationOverride !== null)
        {setCustomDuration(result.customDurationOverride);}
      if (result.themeIdOverride) {setSelectedThemeId(result.themeIdOverride);}
      if (result.goalOverride !== null) {setDraftGoal(result.goalOverride);}
      if (result.showAdvancedOverride !== null)
        {setShowAdvanced(result.showAdvancedOverride);}
      if (result.showCustomizationOverride !== null)
        {setShowCustomization(result.showCustomizationOverride);}
    };
    run().finally(() => {
      if (!isCancelled) {setHasHydratedDraft(true);}
    });
    return () => {
      isCancelled = true;
    };
  }, [
    currentStreak,
    masteryStateKey,
    params,
    params?.goal,
    params?.presetDuration,
    params?.presetId,
    params?.selectedThemeId,
    params?.suggestedDurationSeconds,
    sessionDraftKey,
    storage,
    userId,
  ]);

  const prevAutoApplyKeyRef = useRef(
    `${hasAutoAppliedSuggestion}-${hasHydratedDraft}-${JSON.stringify(params)}-${smartSuggestion?.preset.id ?? ''}`,
  );
  const currentAutoApplyKey = `${hasAutoAppliedSuggestion}-${hasHydratedDraft}-${JSON.stringify(params)}-${smartSuggestion?.preset.id ?? ''}`;
  if (
    !hasAutoAppliedSuggestion &&
    hasHydratedDraft &&
    currentAutoApplyKey !== prevAutoApplyKeyRef.current
  ) {
    prevAutoApplyKeyRef.current = currentAutoApplyKey;
    if (
      shouldAutoApplySmartSuggestion({
        hasSavedDraft,
        params: params ?? {},
        smartSuggestionPresetId: smartSuggestion?.preset.id ?? null,
      }) &&
      smartSuggestion
    ) {
      setSelectedPreset(smartSuggestion.preset);
      setSelectedCategory(smartSuggestion.preset.category ?? 'standard');
      setHasAutoAppliedSuggestion(true);
    }
  }

  // SAFETY: saveSessionDraft is an async side-effect that persists UI state to storage;
  // must run as an effect triggered by changes to draftable fields.
  useEffect(() => {
    if (!userId || !hasHydratedDraft) {return;}
    saveSessionDraft(storage, sessionDraftKey, {
      presetId: selectedPreset.id,
      selectedCategory,
      customDuration,
      selectedThemeId,
      showAdvanced,
      goal: draftGoal,
    });
  }, [
    customDuration,
    draftGoal,
    hasHydratedDraft,
    selectedCategory,
    selectedPreset.id,
    selectedThemeId,
    sessionDraftKey,
    showAdvanced,
    storage,
    userId,
  ]);

  return {
    customDuration, draftGoal, masteryState, selectedCategory,
    selectedPreset, selectedSessionMode, selectedThemeId,
    showAdvanced, showCustomization, smartSuggestion,
    sessionDraftKey, storage,
    setCustomDuration, setDraftGoal, setSelectedCategory,
    setSelectedPreset, setSelectedSessionMode, setSelectedThemeId,
    setShowAdvanced, setShowCustomization,
  };
}
