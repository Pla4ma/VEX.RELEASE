import { captureSilentFailure } from '../../../utils/silent-failure';
import { useEffect, useMemo, useState } from 'react';

import {
  shouldAutoApplySmartSuggestion,
  shouldOpenCustomizationByDefault,
} from '../../../features/session-start/service';
import type { MasteryState } from '../../../features/mastery/types';
import type { SessionStackParams } from '../../../navigation/types';
import { getMMKVStorageAdapter } from '../../../persistence/MMKVStorageAdapter';
import { SessionMode } from '../../../session/modes';
import { resolveSessionMode } from '../../../session/modes';
import {
  hydrateMasteryState,
  MasteryStateSchema,
  PRESETS,
  resolveSmartSuggestion,
  SESSION_DRAFT_MAX_AGE_MS,
  SessionDraftSchema,
  type PresetWithIcon,
  type SmartSuggestion,
} from '../utils/session-setup';

type SessionSetupParams = SessionStackParams['SessionSetup'];

export function useSessionSetupState(
  userId: string,
  params: SessionSetupParams | undefined,
  currentStreak: number,
) {
  const storage = useMemo(() => getMMKVStorageAdapter(), []);
  const sessionDraftKey = useMemo(() => `session_draft_${userId}`, [userId]);
  const masteryStateKey = useMemo(() => `mastery_state_${userId}`, [userId]);
  const initialPreset = useMemo(() => {
    if (params?.presetId) {
      return PRESETS.find((preset) => preset.id === params.presetId) ?? PRESETS[1];
    }

    return PRESETS[1];
  }, [params?.presetId]);

  const [selectedPreset, setSelectedPreset] = useState<PresetWithIcon>(initialPreset);
  const [selectedCategory, setSelectedCategory] = useState(initialPreset.category ?? 'standard');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customDuration, setCustomDuration] = useState(
    params?.presetDuration ? Math.max(1, Math.round(params.presetDuration / 60)) : 30,
  );
  const [draftGoal, setDraftGoal] = useState(params?.goal);
  const [selectedThemeId, setSelectedThemeId] = useState(params?.selectedThemeId ?? 'default');
  const [selectedSessionMode, setSelectedSessionMode] = useState<SessionMode>(
    params?.presetMode
      ? resolveSessionMode(params.presetMode)
      : params?.source === 'content-study'
        ? SessionMode.STUDY
        : SessionMode.LIGHT_FOCUS,
  );
  const [showCustomization, setShowCustomization] = useState(
    shouldOpenCustomizationByDefault(params ?? {}),
  );
  const [hasHydratedDraft, setHasHydratedDraft] = useState(false);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [hasAutoAppliedSuggestion, setHasAutoAppliedSuggestion] = useState(false);
  const [masteryState, setMasteryState] = useState<MasteryState | null>(null);
  const [smartSuggestion, setSmartSuggestion] = useState<SmartSuggestion | null>(null);

  useEffect(() => {
    if (params?.presetId) {
      const matchedPreset = PRESETS.find((preset) => preset.id === params.presetId);
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

    const routedDurationSeconds = params?.presetDuration ?? params?.suggestedDurationSeconds;
    if (routedDurationSeconds) {
      setSelectedPreset(PRESETS[5]);
      setSelectedCategory('custom');
      setCustomDuration(Math.max(1, Math.round(routedDurationSeconds / 60)));
    }

    if (params?.presetMode) {
      setSelectedSessionMode(resolveSessionMode(params.presetMode));
    }
  }, [params?.goal, params?.presetDuration, params?.presetId, params?.presetMode, params?.selectedThemeId, params?.suggestedDurationSeconds]);

  useEffect(() => {
    let isCancelled = false;

    const restoreDraft = async () => {
      if (!userId) {
        if (!isCancelled) {
          setHasHydratedDraft(true);
        }
        return;
      }

      try {
        const rawDraft = await storage.getItem(sessionDraftKey);
        const rawMastery = await storage.getItem(masteryStateKey);
        const parsedMastery = rawMastery ? MasteryStateSchema.safeParse(JSON.parse(rawMastery) as unknown) : null;

        if (!isCancelled) {
          setMasteryState(parsedMastery?.success ? hydrateMasteryState(parsedMastery.data, userId) : null);
          setSmartSuggestion(resolveSmartSuggestion(parsedMastery?.success ? parsedMastery.data : null, currentStreak));
        }

        if (!rawDraft || isCancelled) {
          if (!isCancelled) {
            setHasSavedDraft(false);
            setHasHydratedDraft(true);
          }
          return;
        }

        const parsedDraft = SessionDraftSchema.safeParse(JSON.parse(rawDraft) as unknown);
        if (!parsedDraft.success) {
          await storage.removeItem(sessionDraftKey);
          return;
        }

        if (Date.now() - parsedDraft.data.savedAt > SESSION_DRAFT_MAX_AGE_MS) {
          await storage.removeItem(sessionDraftKey);
          return;
        }

        if (!isCancelled) {
          setHasSavedDraft(true);
        }

        const matchedPreset = PRESETS.find((preset) => preset.id === parsedDraft.data.presetId);
        const hasRoutedDuration = Boolean(params?.presetDuration ?? params?.suggestedDurationSeconds);
        if (matchedPreset && !params?.presetId && !hasRoutedDuration) {
          setSelectedPreset(matchedPreset);
        }
        if (!params?.presetId && !hasRoutedDuration) {
          setSelectedCategory(parsedDraft.data.selectedCategory);
          setCustomDuration(parsedDraft.data.customDuration);
        }
        if (!params?.selectedThemeId) {
          setSelectedThemeId(parsedDraft.data.selectedThemeId);
        }
        if (!params?.goal) {
          setDraftGoal(parsedDraft.data.goal);
        }
        setShowAdvanced(parsedDraft.data.showAdvanced);
        if (
          parsedDraft.data.presetId !== PRESETS[1].id ||
          parsedDraft.data.selectedThemeId !== 'default' ||
          parsedDraft.data.showAdvanced
        ) {
          setShowCustomization(true);
        }
      } catch (error) { captureSilentFailure(error, { feature: 'screens', operation: 'network-fallback', type: 'network' });
        try {
          await storage.removeItem(sessionDraftKey);
        } catch (error) { captureSilentFailure(error, { feature: 'screens', operation: 'network-fallback', type: 'network' });}
      } finally {
        if (!isCancelled) {
          setHasHydratedDraft(true);
        }
      }
    };

    void restoreDraft();

    return () => {
      isCancelled = true;
    };
  }, [currentStreak, masteryStateKey, params?.goal, params?.presetDuration, params?.presetId, params?.selectedThemeId, params?.suggestedDurationSeconds, sessionDraftKey, storage, userId]);

  useEffect(() => {
    if (!hasHydratedDraft || hasAutoAppliedSuggestion) {
      return;
    }

    if (!shouldAutoApplySmartSuggestion({
      hasSavedDraft,
      params: params ?? {},
      smartSuggestionPresetId: smartSuggestion?.preset.id ?? null,
    })) {
      return;
    }

    if (!smartSuggestion) {
      return;
    }

    setSelectedPreset(smartSuggestion.preset);
    setSelectedCategory(smartSuggestion.preset.category ?? 'standard');
    setHasAutoAppliedSuggestion(true);
  }, [hasAutoAppliedSuggestion, hasHydratedDraft, hasSavedDraft, params, smartSuggestion]);

  useEffect(() => {
    if (!userId || !hasHydratedDraft) {
      return;
    }

    const saveDraft = async () => {
      try {
        const draftPayload = SessionDraftSchema.parse({
          savedAt: Date.now(),
          presetId: selectedPreset.id,
          selectedCategory,
          customDuration,
          selectedThemeId,
          showAdvanced,
          goal: draftGoal,
        });
        await storage.setItem(sessionDraftKey, JSON.stringify(draftPayload));
      } catch (error) { captureSilentFailure(error, { feature: 'screens', operation: 'network-fallback', type: 'network' });}
    };

    void saveDraft();
  }, [customDuration, draftGoal, hasHydratedDraft, selectedCategory, selectedPreset.id, selectedThemeId, sessionDraftKey, showAdvanced, storage, userId]);

  return {
    customDuration,
    draftGoal,
    masteryState,
    selectedCategory,
    selectedPreset,
    selectedSessionMode,
    selectedThemeId,
    setCustomDuration,
    setDraftGoal,
    setSelectedCategory,
    setSelectedPreset,
    setSelectedSessionMode,
    setSelectedThemeId,
    setShowAdvanced,
    setShowCustomization,
    showAdvanced,
    showCustomization,
    smartSuggestion,
    sessionDraftKey,
    storage,
  };
}
