import { z } from 'zod';
import {
  fetchContentHistoryRecords,
  fetchContentRecord,
  fetchGenerationRecord,
  deleteContentRecord,
  deleteStudyFileRecord,
  invokeContentStudy,
  updateContentTextRecord,
  uploadStudyFileRecord,
} from './repository';
import { buildError } from './validation';
import { CONTENT_STUDY_API, ERROR_MESSAGES } from './constants';
import {
  CONTENT_STUDY_CONSTANTS,
  ContentStudyErrorCode,
  type ExtractContentRequest,
  type GenerateStudyPlanRequest,
  type SubmitContentRequest,
  type SubmitFeedbackRequest,
} from './types';
import type { QuizItem } from './types';

const submitContentResponseSchema = z.object({
  success: z.boolean(),
  contentId: z.string(),
  status: z.enum(['PENDING', 'EXTRACTING', 'EXTRACTED', 'PROCESSING', 'READY', 'FAILED']),
  message: z.string(),
  error: z.string().optional(),
});

const extractContentResponseSchema = z.object({
  success: z.boolean(),
  contentId: z.string(),
  extractedLength: z.number().default(0),
  status: z.enum(['PENDING', 'EXTRACTING', 'EXTRACTED', 'PROCESSING', 'READY', 'FAILED']),
  error: z.string().optional(),
});

const generationResponseSchema = z.object({
  success: z.boolean(),
  generationId: z.string(),
  contentId: z.string(),
  summary: z.string(),
  keyConcepts: z.array(z.string()),
  tasks: z.array(z.unknown()),
  quizItems: z.array(z.unknown()),
  sessionPlan: z.unknown(),
  remaining: z.number(),
  error: z.string().optional(),
});

const statusResponseSchema = z.object({
  success: z.boolean(),
  contentId: z.string(),
  status: z.enum(['PENDING', 'EXTRACTING', 'EXTRACTED', 'PROCESSING', 'READY', 'FAILED']),
  extractedLength: z.number().default(0),
  errorMessage: z.string().optional(),
  generation: z.unknown().optional(),
  error: z.string().optional(),
});

const feedbackResponseSchema = z.object({ success: z.boolean() });

function normalizeError(error: unknown, code: ContentStudyErrorCode, message: string) {
  if (error instanceof Error) {
    return buildError(code, error.message || message, { cause: error.name }, true);
  }
  return buildError(code, message, undefined, true);
}

async function invokeAndParse<T>(
  path: string,
  schema: z.ZodSchema<T>,
  body?: unknown,
  method?: 'GET' | 'POST'
): Promise<T> {
  const { data, error } = await invokeContentStudy(path, body, method);
  if (error) {
    throw normalizeError(error, ContentStudyErrorCode.NETWORK_ERROR, ERROR_MESSAGES.NETWORK_ERROR);
  }
  return schema.parse(data);
}

export async function submitContent(userId: string, request: SubmitContentRequest) {
  try {
    const response = await invokeAndParse(CONTENT_STUDY_API.ENDPOINTS.SUBMIT, submitContentResponseSchema, {
      ...request,
      userId,
    });
    if (!response.success) {
      throw buildError(ContentStudyErrorCode.INVALID_INPUT, response.error ?? ERROR_MESSAGES.DEFAULT, undefined, false);
    }
    return response;
  } catch (error) {
    throw normalizeError(error, ContentStudyErrorCode.INVALID_INPUT, ERROR_MESSAGES.DEFAULT);
  }
}

export async function extractContent(request: ExtractContentRequest) {
  const response = await invokeAndParse(CONTENT_STUDY_API.ENDPOINTS.EXTRACT, extractContentResponseSchema, request);
  if (!response.success) {
    throw buildError(ContentStudyErrorCode.EXTRACTION_FAILED, response.error ?? ERROR_MESSAGES.EXTRACTION_FAILED, undefined, true);
  }
  return response;
}

export async function generateStudyPlan(request: GenerateStudyPlanRequest) {
  const response = await invokeAndParse(CONTENT_STUDY_API.ENDPOINTS.GENERATE, generationResponseSchema, request);
  if (!response.success) {
    const code = response.error?.toLowerCase().includes('limit')
      ? ContentStudyErrorCode.RATE_LIMIT_EXCEEDED
      : ContentStudyErrorCode.GENERATION_FAILED;
    throw buildError(code, response.error ?? ERROR_MESSAGES.GENERATION_FAILED, undefined, code !== ContentStudyErrorCode.RATE_LIMIT_EXCEEDED);
  }
  return response;
}

export async function getContentStatus(contentId: string) {
  const response = await invokeAndParse(
    `${CONTENT_STUDY_API.ENDPOINTS.STATUS}/${contentId}`,
    statusResponseSchema,
    undefined,
    'GET'
  );
  if (!response.success) {
    throw buildError(ContentStudyErrorCode.CONTENT_NOT_FOUND, response.error ?? 'Content not found', undefined, false);
  }
  return response;
}

export async function submitFeedback(request: SubmitFeedbackRequest) {
  return invokeAndParse(CONTENT_STUDY_API.ENDPOINTS.FEEDBACK, feedbackResponseSchema, request);
}

export async function uploadStudyFile(fileUri: string, filename: string, userId: string) {
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

export async function getQuizForStudyPlan(studyPlanId: string): Promise<QuizItem[]> {
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

export async function pollContentStatus(contentId: string, onUpdate?: (status: Awaited<ReturnType<typeof getContentStatus>>) => void) {
  for (let attempt = 0; attempt < CONTENT_STUDY_CONSTANTS.MAX_STATUS_POLL_ATTEMPTS; attempt += 1) {
    const status = await getContentStatus(contentId);
    onUpdate?.(status);
    if (status.status === 'READY' || status.status === 'FAILED' || status.status === 'EXTRACTED') {
      return status;
    }
    await new Promise((resolve) => setTimeout(resolve, CONTENT_STUDY_CONSTANTS.STATUS_POLL_INTERVAL_MS));
  }
  throw buildError(ContentStudyErrorCode.AI_TIMEOUT, 'Processing is taking longer than expected.', undefined, true);
}
