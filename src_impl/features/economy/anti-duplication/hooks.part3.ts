import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { eventBus } from "../../../events";
import { antiDuplicationService } from "./deduplication-service";
import type { DeduplicationRequest, DeduplicationResult, DeduplicationAttempt, ExploitDetection, DeduplicationAnalytics } from "./schemas";


export function useAntiDuplicationEvents() {
  const { showWarning } = useDuplicateWarning();
  const { showAlert } = useExploitAlert();

  // Handle duplicate detected events
  const handleDuplicateDetected = useCallback((data: { result: DeduplicationResult }) => {
    const { result } = data;

    if (result.result === 'BLOCKED_DUPLICATE') {
      showWarning(result.warningMessage || 'Duplicate action detected', 'warning');
    }
  }, [showWarning]);

  // Handle exploit detected events
  const handleExploitDetected = useCallback((data: { detection: ExploitDetection }) => {
    const { detection } = data;

    if (detection.severity === 'HIGH' || detection.severity === 'CRITICAL') {
      showAlert(detection);
    } else {
      showWarning('Suspicious activity detected', 'warning');
    }
  }, [showAlert, showWarning]);

  return {
    handleDuplicateDetected,
    handleExploitDetected,
  };
}