import { triggerHapticEvent, HapticEvents } from "../../../constants/haptics";
import { eventBus } from "../../../events";

export const formatTime = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
};

export const computeDifferences = (
  localState: { elapsedTime: number; progress: number },
  remoteState: { elapsedTime: number; progress: number },
) => {
  const timeDifference = Math.abs(localState.elapsedTime - remoteState.elapsedTime);
  const progressDifference = Math.abs(localState.progress - remoteState.progress);
  return { timeDifference, progressDifference };
};

export const handleResolve = async (
  option: "local" | "remote" | "merge",
  localState: { progress: number; elapsedTime: number },
  remoteState: { progress: number; elapsedTime: number },
  onResolveLocal: () => Promise<void> | void,
  onResolveRemote: () => Promise<void> | void,
  onMerge?: () => Promise<void> | void,
): Promise<void> => {
  const timeDifference = Math.abs(localState.elapsedTime - remoteState.elapsedTime);
  triggerHapticEvent(HapticEvents.BUTTON_PRESS);
  eventBus.publish("analytics:track", {
    event: "session_conflict_resolution",
    properties: {
      resolution: option,
      localProgress: localState.progress,
      remoteProgress: remoteState.progress,
      timeDifference,
    },
  });

  if (option === "local") {
    await onResolveLocal();
  } else if (option === "remote") {
    await onResolveRemote();
  } else if (option === "merge" && onMerge) {
    await onMerge();
  }
};
