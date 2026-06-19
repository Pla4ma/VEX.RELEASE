import { useState, useCallback, useRef } from 'react';
import { getSessionOrchestrator } from '../SessionOrchestrator';

export function useSessionPresets() {
  const orchestratorRef = useRef(getSessionOrchestrator());
  const orchestrator = orchestratorRef.current;
  const [presets, setPresets] = useState(() => orchestrator.getAllPresets());

  const refresh = useCallback(() => {
    setPresets(orchestrator.getAllPresets());
  }, [orchestrator]);

  const createPreset = useCallback(
    async (config: Parameters<typeof orchestrator.createCustomPreset>[0]) => {
      const preset = await orchestrator.createCustomPreset(config);
      refresh();
      return preset;
    },
    [orchestrator, refresh],
  );

  const deletePreset = useCallback(
    async (presetId: string) => {
      await orchestrator.deletePreset(presetId);
      refresh();
    },
    [orchestrator, refresh],
  );

  return { presets, createPreset, deletePreset, refresh };
}
