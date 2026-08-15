/**
 * useDay0ActionSave — encapsulates the brain-dump / plan save logic for
 * the Day-0 action sheet so the component file stays under the line limit.
 */
import { useCallback } from 'react';
import { captureException } from '../../../config/sentry';
import { useCaptureMutation } from '../../../features/capture/hooks';
import { useAddPlanItem } from '../../../features/plan/hooks';
import { triggerHaptic } from '../../../utils/haptics';
import type { ToastOptions } from '../../../shared/ui/components/Toast.types';
import { buildDay0AgentPlan } from '../services/day0-agent-service';
import type { Day0Mode } from '../services/day0-agent-schemas';

interface UseDay0ActionSaveInput {
  mode: Day0Mode | null;
  text: string;
  userId: string;
  onSuccess: () => void;
  showToast: (input: ToastOptions) => string;
}

export function useDay0ActionSave({
  mode,
  text,
  userId,
  onSuccess,
  showToast,
}: UseDay0ActionSaveInput): {
  isSaving: boolean;
  handleSave: () => Promise<void>;
} {
  const captureMutation = useCaptureMutation(userId);
  const addPlanItem = useAddPlanItem(userId);
  const isSaving = captureMutation.isPending || addPlanItem.isPending;

  const handleSave = useCallback(async (): Promise<void> => {
    if (!mode || !text.trim()) {
      return;
    }
    try {
      if (mode === 'create') {
        await captureMutation.mutateAsync({
          content: text,
          metadata: { source: 'day0_create_signal' },
          type: 'braindump',
        });
      } else {
        const builtPlan = buildDay0AgentPlan({ mode, intent: text });
        for (const step of builtPlan.steps) {
          await addPlanItem.mutateAsync({
            description: step.description,
            estimatedMinutes: step.estimatedMinutes,
            priority: step.priority,
            tags: step.tags,
            title: step.title,
          });
        }
      }
      triggerHaptic('success');
      showToast({
        message:
          mode === 'create' ? 'Brain dump saved.' : 'Tiny plan saved to Today.',
        title: 'First signal captured',
        type: 'success',
      });
      onSuccess();
    } catch (error: unknown) {
      const capturedError =
        error instanceof Error
          ? error
          : new Error('Unknown Day 0 action save failure');
      captureException(capturedError, { area: 'day0ActionSheet', mode });
      showToast({
        message: 'VEX could not save that signal. Try once more.',
        title: 'Signal did not save',
        type: 'error',
      });
    }
  }, [addPlanItem, captureMutation, mode, onSuccess, showToast, text]);

  return { isSaving, handleSave };
}
