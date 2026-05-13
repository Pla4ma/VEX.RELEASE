import { z } from "zod";
import { getSupabaseClient } from "../../config/supabase";
import { createDebugger } from "../../utils/debug";
import { useState, useEffect, useCallback } from "react";


export function useSmartNotifications(userId: string | undefined): UseSmartNotificationsResult {
  const [peakWindow, setPeakWindow] = useState<PeakFocusWindow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canSend, setCanSend] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const window = await analyzePeakFocusWindow(userId);
    setPeakWindow(window);

    const inWindow = isInPeakWindow(window.peakHour);
    const underLimit = await checkRateLimit(userId);
    setCanSend(inWindow && underLimit);

    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    peakWindow,
    isLoading,
    canSendNotification: canSend,
    refresh,
  };
}