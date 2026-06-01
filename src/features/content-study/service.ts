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
import {
  submitContentResponseSchema,
  extractContentResponseSchema,
  generationResponseSchema,
  statusResponseSchema,
  feedbackResponseSchema,
  ContentStudyTimeoutFallbackSchema,
  type ContentStudyTimeoutFallback,
  normalizeError,
  invokeAndParse,
} from './api-schemas';

export { ContentStudyTimeoutFallbackSchema } from './api-schemas';
export type { ContentStudyTimeoutFallback } from './api-schemas';
export {
  uploadStudyFile,
  deleteStudyFile,
  fetchContentHistory,
  fetchContentById,
  fetchGenerationById,
  getQuizForStudyPlan,
  updateContentText,
  deleteContent,
} from './service-crud';

export async function submitContent(
  userId: string,
  request: SubmitContentRequest,
) {
  try {
    const response = await invokeAndParse(
      CONTENT_STUDY_API.ENDPOINTS.SUBMIT,
      submitContentResponseSchema,
      { ...request, userId },
    );
    if (!response.success) {
      throw buildError(
        ContentStudyErrorCode.INVALID_INPUT,
        response.error ?? ERROR_MESSAGES.DEFAULT,
        undefined,
        false,
      );
    }
    return response;
  } catch (error) {
    throw normalizeError(
      error,
      ContentStudyErrorCode.INVALID_INPUT,
      ERROR_MESSAGES.DEFAULT,
    );
  }
}

export async function extractContent(request: ExtractContentRequest) {
  const response = await invokeAndParse(
    CONTENT_STUDY_API.ENDPOINTS.EXTRACT,
    extractContentResponseSchema,
    request,
  );
  if (!response.success) {
    throw buildError(
      ContentStudyErrorCode.EXTRACTION_FAILED,
      response.error ?? ERROR_MESSAGES.EXTRACTION_FAILED,
      undefined,
      true,
    );
  }
  return response;
}

export async function generateStudyPlan(request: GenerateStudyPlanRequest) {
  const response = await invokeAndParse(
    CONTENT_STUDY_API.ENDPOINTS.GENERATE,
    generationResponseSchema,
    request,
  );
  if (!response.success) {
    const code = response.error?.toLowerCase().includes('limit')
      ? ContentStudyErrorCode.RATE_LIMIT_EXCEEDED
      : ContentStudyErrorCode.GENERATION_FAILED;
    throw buildError(
      code,
      response.error ?? ERROR_MESSAGES.GENERATION_FAILED,
      undefined,
      code !== ContentStudyErrorCode.RATE_LIMIT_EXCEEDED,
    );
  }
  return response;
}

export async function getContentStatus(contentId: string) {
  const response = await invokeAndParse(
    `${CONTENT_STUDY_API.ENDPOINTS.STATUS}/${contentId}`,
    statusResponseSchema,
    undefined,
    'GET',
  );
  if (!response.success) {
    throw buildError(
      ContentStudyErrorCode.CONTENT_NOT_FOUND,
      response.error ?? 'Content not found',
      undefined,
      false,
    );
  }
  return response;
}

export async function submitFeedback(request: SubmitFeedbackRequest) {
  return invokeAndParse(
    CONTENT_STUDY_API.ENDPOINTS.FEEDBACK,
    feedbackResponseSchema,
    request,
  );
}

export function buildContentStudyTimeoutFallback(): ContentStudyTimeoutFallback {
  return ContentStudyTimeoutFallbackSchema.parse({
    body: 'Start a focused study session now. VEX can retry content generation when service health recovers.',
    ctaLabel: 'Start study session',
    title: 'Content generation is still warming up',
  });
}

export async function pollContentStatus(
  contentId: string,
  onUpdate?: (status: Awaited<ReturnType<typeof getContentStatus>>) => void,
) {
  for (
    let attempt = 0;
    attempt < CONTENT_STUDY_CONSTANTS.MAX_STATUS_POLL_ATTEMPTS;
    attempt += 1
  ) {
    const status = await getContentStatus(contentId);
    onUpdate?.(status);
    if (
      status.status === 'READY' ||
      status.status === 'FAILED' ||
      status.status === 'EXTRACTED'
    ) {
      return status;
    }
    await new Promise((resolve) =>
      setTimeout(resolve, CONTENT_STUDY_CONSTANTS.STATUS_POLL_INTERVAL_MS),
    );
  }
  throw buildError(
    ContentStudyErrorCode.AI_TIMEOUT,
    'Processing is taking longer than expected.',
    undefined,
    true,
  );
}
