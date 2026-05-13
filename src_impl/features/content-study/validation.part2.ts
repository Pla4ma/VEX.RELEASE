import { z } from "zod";
import { ContentSourceType, ValidationError, ContentStudyErrorCode, ContentStudyError, type ErrorRecoveryAction } from "./types";
import { CONTENT_STUDY_CONSTANTS } from "./types";


export function validateFileUpload(file: { uri: string; name: string; size: number; type: string } | null): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!file) {
    errors.push({
      field: 'file',
      code: 'REQUIRED',
      message: 'Please select a file',
      severity: 'error',
    });
    return { isValid: false, errors, warnings };
  }

  // Size validation
  if (file.size > CONTENT_STUDY_CONSTANTS.MAX_PDF_SIZE) {
    const maxSizeMB = CONTENT_STUDY_CONSTANTS.MAX_PDF_SIZE / (1024 * 1024);
    const actualSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    errors.push({
      field: 'file',
      code: 'FILE_TOO_LARGE',
      message: `File size (${actualSizeMB}MB) exceeds maximum allowed (${maxSizeMB}MB)`,
      severity: 'error',
    });
  }

  // Type validation
  const supportedTypes: readonly string[] = [...CONTENT_STUDY_CONSTANTS.SUPPORTED_PDF_TYPES, ...CONTENT_STUDY_CONSTANTS.SUPPORTED_TEXT_TYPES];

  if (!supportedTypes.includes(file.type)) {
    errors.push({
      field: 'file',
      code: 'UNSUPPORTED_TYPE',
      message: `File type "${file.type}" is not supported. Please use PDF, TXT, or MD files.`,
      severity: 'error',
    });
  }

  // Filename validation
  if (!file.name || file.name.trim().length === 0) {
    errors.push({
      field: 'file',
      code: 'INVALID_NAME',
      message: 'File name is invalid',
      severity: 'error',
    });
  }

  // Warning for large but acceptable files
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > 5 && sizeMB <= 10) {
    warnings.push({
      field: 'file',
      code: 'LARGE_FILE',
      message: 'Large files may take longer to upload and process',
      severity: 'warning',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      fileType: file.type,
    },
  };
}

export function validateTitle(title: string | undefined): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!title || title.trim().length === 0) {
    return { isValid: true, errors, warnings }; // Title is optional
  }

  if (title.length > CONTENT_STUDY_CONSTANTS.MAX_TITLE_LENGTH) {
    errors.push({
      field: 'title',
      code: 'TOO_LONG',
      message: `Title must be less than ${CONTENT_STUDY_CONSTANTS.MAX_TITLE_LENGTH} characters`,
      severity: 'error',
    });
  }

  // Check for problematic characters
  if (/[<>{}[\]]/.test(title)) {
    warnings.push({
      field: 'title',
      code: 'SPECIAL_CHARS',
      message: 'Title contains special characters that may cause display issues',
      severity: 'warning',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateContentSubmission(
  type: ContentSourceType,
  data: {
    text?: string;
    file?: { uri: string; name: string; size: number; type: string } | null;
    url?: string;
    title?: string;
  },
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  let metadata: ValidationResult['metadata'] = {};

  // Validate based on type
  switch (type) {
    case 'PASTE': {
      const textResult = validatePastedText(data.text || '');
      errors.push(...textResult.errors);
      warnings.push(...textResult.warnings);
      metadata = { ...metadata, ...textResult.metadata };
      break;
    }
    case 'PDF': {
      const fileResult = validateFileUpload(data.file || null);
      errors.push(...fileResult.errors);
      warnings.push(...fileResult.warnings);
      metadata = { ...metadata, ...fileResult.metadata };
      break;
    }
    case 'YOUTUBE': {
      const urlResult = validateYouTubeUrl(data.url || '');
      errors.push(...urlResult.errors);
      warnings.push(...urlResult.warnings);
      metadata = { ...metadata, ...urlResult.metadata };
      break;
    }
    case 'URL': {
      // Generic URL validation (for future expansion)
      if (!data.url || !data.url.trim()) {
        errors.push({
          field: 'url',
          code: 'REQUIRED',
          message: 'URL is required',
          severity: 'error',
        });
      } else if (!/^https?:\/\/.+/.test(data.url)) {
        errors.push({
          field: 'url',
          code: 'INVALID_FORMAT',
          message: 'Please enter a valid URL starting with http:// or https://',
          severity: 'error',
        });
      }
      break;
    }
  }

  // Validate title if provided
  const titleResult = validateTitle(data.title);
  errors.push(...titleResult.errors);
  warnings.push(...titleResult.warnings);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata,
  };
}