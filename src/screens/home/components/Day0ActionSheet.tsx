import React, { useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';

import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import { captureException } from '../../../config/sentry';
import { useCaptureMutation } from '../../../features/capture/hooks';
import { useAddPlanItem } from '../../../features/plan/hooks';
import { Icon } from '../../../icons/components/Icon';
import { borderRadius } from '../../../theme/tokens/radius';
import { spacing } from '../../../theme/tokens/spacing';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { triggerHaptic } from '../../../utils/haptics';
import { StandardHitSlops } from '../../../utils/touchTarget';
import { type } from '../../reference-ui/referenceTokens';
import type { ToastOptions } from '../../../shared/ui/components/Toast.types';
import { buildDay0AgentPlan } from '../services/day0-agent-service';
import type { Day0Mode } from '../services/day0-agent-schemas';

interface Day0ActionSheetProps {
  mode: Day0Mode | null;
  onClose: () => void;
  onSaved: () => void;
  showToast: (input: ToastOptions) => string;
  userId: string;
}

            
const MODE_LABELS: Record<Day0Mode, { title: string; prompt: string }> = {
  focus: { title: 'Focus', prompt: 'What needs a clean block?' },
  create: { title: 'Brain Dump', prompt: 'Drop the messy thought here.' },
  study: { title: 'Tiny Study Plan', prompt: 'What are you trying to learn?' },
  quest: { title: 'Tiny Quest Plan', prompt: 'What win would make today count?' },
};

export function Day0ActionSheet({
  mode,
  onClose,
  onSaved,
  showToast,
  userId,
}: Day0ActionSheetProps): React.ReactNode {
  const [text, setText] = useState('');
  const captureMutation = useCaptureMutation(userId);
  const addPlanItem = useAddPlanItem(userId);
  const activeCopy = mode ? MODE_LABELS[mode] : null;
  const plan = useMemo(
    () => (mode && text.trim() ? buildDay0AgentPlan({ mode, intent: text }) : null),
    [mode, text],
  );
  const isSaving = captureMutation.isPending || addPlanItem.isPending;

  const handleSave = useCallback(async (): Promise<void> => {
    if (!mode || !text.trim()) {return;}
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
      onSaved();
      showToast({
        message: mode === 'create' ? 'Brain dump saved.' : 'Tiny plan saved to Today.',
        title: 'First signal captured',
        type: 'success',
      });
      setText('');
      onClose();
    } catch (error: unknown) {
      const capturedError = error instanceof Error
        ? error
        : new Error('Unknown Day 0 action save failure');
      captureException(capturedError, { area: 'day0ActionSheet', mode });
      showToast({
        message: 'VEX could not save that signal. Try once more.',
        title: 'Signal did not save',
        type: 'error',
      });
    }
  }, [addPlanItem, captureMutation, mode, onClose, onSaved, showToast, text]);

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={mode !== null}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'flex-end' }}
      >
<Pressable
          accessibilityLabel="Close Day 0 action"
          accessibilityRole="button"
          accessibilityHint="Closes the Day 0 action sheet"
          onPress={onClose}
          style={{ flex: 1 }}
        />
        <View
          style={{
            backgroundColor: vexLightGlass.glass.fillStrong,
            borderColor: vexLightGlass.glass.border,
            borderTopLeftRadius: borderRadius['2xl'],
            borderTopRightRadius: borderRadius['2xl'],
            borderWidth: 1,
            padding: spacing[5],
          }}
        >
          <View style={{ alignItems: 'center', flexDirection: 'row' }}>
            <View style={{ flex: 1 }}>
              <Text style={type.kicker}>VEX AGENT</Text>
              <Text style={[type.hero, { marginTop: spacing[1] }]}>
                {activeCopy?.title ?? 'Signal'}
              </Text>
            </View>
            <Pressable
              accessibilityHint="Dismisses this Day 0 action sheet"
              accessibilityLabel="Close action sheet"
              accessibilityRole="button"
              hitSlop={StandardHitSlops.ICON}
              onPress={onClose}
            >
              <Icon color={vexLightGlass.text.secondary} name="x" size="sm" />
            </Pressable>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={[type.body, { marginTop: spacing[3] }]}>
              {activeCopy?.prompt}
            </Text>
            <TextInput
              accessibilityHint="Type the first signal you want VEX to shape"
              accessibilityLabel="First signal input"
              multiline
              onChangeText={setText}
              placeholder="Example: I need to start my biology notes without spiraling."
              placeholderTextColor={vexLightGlass.text.disabled}
              style={{}}
              value={text}
            />
            {mode !== 'create' && plan ? (
              <Text style={[type.body, { marginTop: spacing[3] }]}>
                {plan.summary}
              </Text>
            ) : null}
            <Button
              accessibilityHint="Saves this Day 0 signal"
              accessibilityLabel="Save first signal"
              fullWidth
              isDisabled={!text.trim()}
              isLoading={isSaving}
              mt="md"
              onPress={handleSave}
              size="lg"
            >
              {mode === 'create' ? 'Save brain dump' : 'Save tiny plan'}
            </Button>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
