import { captureSilentFailure } from "../../utils/silent-failure";
import type { ContentStudyError, ErrorRecoveryAction } from "./types";
import { CONTENT_STUDY_CONSTANTS, ContentStudyErrorCode } from "./types";
import { buildError, isRecoverableError, shouldRetry, getRetryDelay } from "./validation";
import { captureException } from "../../config/sentry";


export const errorHandler = ContentStudyErrorHandler.getInstance();