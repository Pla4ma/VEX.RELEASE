import {
  SessionSetupNavigationParamsSchema,
  SessionStartSummarySchema,
  type SessionSetupNavigationParams,
  type SessionStartSummary,
} from './schemas';

export function parseSessionSetupParams(input: unknown): {
  params: SessionSetupNavigationParams;
  warningMessage: string | null;
} {
  const result = SessionSetupNavigationParamsSchema.safeParse(input ?? {});
  if (result.success) {return { params: result.data, warningMessage: null };}
  return {
    params: {},
    warningMessage:
      'We reset an invalid session setup request so you can start cleanly.',
  };
}

export function buildSessionStartSummary(input: {
  currentThemeName: string;
  durationMinutes: number;
  hasCustomizations: boolean;
}): SessionStartSummary {
  const { currentThemeName, durationMinutes, hasCustomizations } = input;
  return SessionStartSummarySchema.parse({
    ctaLabel: `Start ${durationMinutes} Min Session`,
    customizationLabel: hasCustomizations ? 'Hide options' : 'Tune session',
    subtitle: `${durationMinutes} min focus - ${currentThemeName} theme`,
  });
}

export function getOfflineSessionStartMessage(
  isOffline: boolean,
): string | null {
  return isOffline
    ? 'You can still start a session offline. Sync-based rewards and coach data may catch up after reconnect.'
    : null;
}

export function shouldOpenCustomizationByDefault(
  params: SessionSetupNavigationParams,
): boolean {
  return params.presetId === 'custom';
}

export function shouldAutoApplySmartSuggestion(input: {
  hasSavedDraft: boolean;
  params: SessionSetupNavigationParams;
  smartSuggestionPresetId: string | null;
}): boolean {
  const { hasSavedDraft, params, smartSuggestionPresetId } = input;
  return Boolean(
    smartSuggestionPresetId &&
    !hasSavedDraft &&
    !params.presetId &&
    !params.suggestedDurationSeconds,
  );
}

export function createStarterSessionConfig(input: {
  durationMinutes: number;
  category?: string | null;
}): {
  duration: number;
  mode: string;
  category?: string | null;
  metadata: Record<string, unknown>;
} {
  return {
    category: input.category || null,
    duration: input.durationMinutes * 60,
    metadata: { isFromOnboarding: true, isStarterSession: true },
    mode: 'STARTER',
  };
}
