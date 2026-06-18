import {
  fetchContentHistoryRecords,
  fetchContentRecord,
  fetchGenerationRecord,
  deleteContentRecord,
  deleteStudyFileRecord,
  updateContentTextRecord,
  uploadStudyFileRecord,
} from './repository';
import type { QuizItem } from './types';

export async function uploadStudyFile(
  fileUri: string,
  filename: string,
  userId: string,
) {
  return uploadStudyFileRecord(fileUri, filename, userId);
}

export async function deleteStudyFile(filePath: string) {
  try {
    await deleteStudyFileRecord(filePath);
  } catch (error) {
    throw new Error(`Failed to delete study file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function fetchContentHistory(userId: string, limit = 20) {
  try {
    return await fetchContentHistoryRecords(userId, limit);
  } catch (error) {
    throw new Error(`Failed to fetch content history: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function fetchContentById(contentId: string) {
  try {
    return await fetchContentRecord(contentId);
  } catch (error) {
    throw new Error(`Failed to fetch content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function fetchGenerationById(generationId: string) {
  try {
    return await fetchGenerationRecord(generationId);
  } catch (error) {
    throw new Error(`Failed to fetch generation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getQuizForStudyPlan(
  studyPlanId: string,
): Promise<QuizItem[]> {
  try {
    const generation = await fetchGenerationRecord(studyPlanId);
    if (!generation) {
      return [];
    }
    return generation.quizItems.slice(0, 3);
  } catch (error) {
    throw new Error(`Failed to get quiz for study plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function updateContentText(contentId: string, editedText: string) {
  try {
    await updateContentTextRecord(contentId, editedText);
  } catch (error) {
    throw new Error(`Failed to update content text: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteContent(contentId: string) {
  try {
    await deleteContentRecord(contentId);
  } catch (error) {
    throw new Error(`Failed to delete content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
