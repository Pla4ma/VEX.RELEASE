import { useState, useCallback, useRef } from 'react';
import { getSessionService } from '../SessionService';

export function useSessionPresets() {
  const serviceRef = useRef(getSessionService());
  const service = serviceRef.current;
  const [presets, setPresets] = useState(service.getAllPresets());

  const refresh = useCallback(() => {
    setPresets(service.getAllPresets());
  }, [service]);

  const createPreset = useCallback(
    async (config: Parameters<typeof service.createCustomPreset>[0]) => {
      const preset = await service.createCustomPreset(config);
      refresh();
      return preset;
    },
    [service, refresh],
  );

  const deletePreset = useCallback(
    async (presetId: string) => {
      await service.deletePreset(presetId);
      refresh();
    },
    [service, refresh],
  );

  return { presets, createPreset, deletePreset, refresh };
}
