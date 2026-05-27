import {
  TomorrowPreviewDataSchema,
  TomorrowPreviewTypeSchema,
  type ComputeTomorrowPreviewInput,
  type TomorrowPreviewData,
  type TomorrowPreviewType,
} from "./tomorrow-preview-schemas";
import { computeTomorrowPreview } from "./tomorrow-preview-compute";
import {
  clearTomorrowPreview,
  loadTomorrowPreview,
  saveTomorrowPreview,
} from "./tomorrow-preview-storage";

export {
  clearTomorrowPreview,
  computeTomorrowPreview,
  loadTomorrowPreview,
  saveTomorrowPreview,
  TomorrowPreviewDataSchema,
  TomorrowPreviewTypeSchema,
};

export type {
  ComputeTomorrowPreviewInput,
  TomorrowPreviewData,
  TomorrowPreviewType,
};

export function useTomorrowPreviewForSession(
  userId: string,
  data: ComputeTomorrowPreviewInput,
): TomorrowPreviewData {
  return computeTomorrowPreview({ ...data, userId });
}

export function useSavedTomorrowPreview(
  userId: string,
): TomorrowPreviewData | null {
  const saved = loadTomorrowPreview(userId);
  if (!saved) {
    return null;
  }
  const now = new Date();
  const savedDate = new Date(saved.savedAt);
  if (
    now.getDate() !== savedDate.getDate() ||
    now.getMonth() !== savedDate.getMonth() ||
    now.getFullYear() !== savedDate.getFullYear()
  ) {
    clearTomorrowPreview(userId);
    return null;
  }
  const { savedAt: _savedAt, ...preview } = saved;
  return preview;
}
