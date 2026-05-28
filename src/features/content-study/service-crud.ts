import {
  fetchContentHistoryRecords,
  fetchContentRecord,
  fetchGenerationRecord,
  deleteContentRecord,
  deleteStudyFileRecord,
  updateContentTextRecord,
  uploadStudyFileRecord,
} from "./repository";
import type { QuizItem } from "./types";

export async function uploadStudyFile(
  fileUri: string,
  filename: string,
  userId: string,
) {
  return uploadStudyFileRecord(fileUri, filename, userId);
}

export async function deleteStudyFile(filePath: string) {
  await deleteStudyFileRecord(filePath);
}

export async function fetchContentHistory(userId: string, limit = 20) {
  return fetchContentHistoryRecords(userId, limit);
}

export async function fetchContentById(contentId: string) {
  return fetchContentRecord(contentId);
}

export async function fetchGenerationById(generationId: string) {
  return fetchGenerationRecord(generationId);
}

export async function getQuizForStudyPlan(
  studyPlanId: string,
): Promise<QuizItem[]> {
  const generation = await fetchGenerationRecord(studyPlanId);
  if (!generation) {
    return [];
  }
  return generation.quizItems.slice(0, 3);
}

export async function updateContentText(contentId: string, editedText: string) {
  await updateContentTextRecord(contentId, editedText);
}

export async function deleteContent(contentId: string) {
  await deleteContentRecord(contentId);
}
