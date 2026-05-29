import type { ValidationError } from "./types";
import { CONTENT_STUDY_CONSTANTS } from "./types";
import type { ValidationResult } from "./validators";

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 100);
}

export function validateFileUpload(
  file: { uri: string; name: string; size: number; type: string } | null,
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  if (!file) {
    errors.push({
      field: "file",
      code: "REQUIRED",
      message: "Please select a file",
      severity: "error",
    });
    return { isValid: false, errors, warnings };
  }
  if (file.size > CONTENT_STUDY_CONSTANTS.MAX_PDF_SIZE) {
    const maxMB = CONTENT_STUDY_CONSTANTS.MAX_PDF_SIZE / (1024 * 1024);
    errors.push({
      field: "file",
      code: "FILE_TOO_LARGE",
      message: `File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds maximum allowed (${maxMB}MB)`,
      severity: "error",
    });
  }
  const supported: readonly string[] = [
    ...CONTENT_STUDY_CONSTANTS.SUPPORTED_PDF_TYPES,
    ...CONTENT_STUDY_CONSTANTS.SUPPORTED_TEXT_TYPES,
  ];
  if (!supported.includes(file.type as string))
    errors.push({
      field: "file",
      code: "UNSUPPORTED_TYPE",
      message: `File type "${file.type}" is not supported. Please use PDF, TXT, or MD files.`,
      severity: "error",
    });
  if (!file.name || file.name.trim().length === 0)
    errors.push({
      field: "file",
      code: "INVALID_NAME",
      message: "File name is invalid",
      severity: "error",
    });
  if (file.size / (1024 * 1024) > 5 && file.size / (1024 * 1024) <= 10)
    warnings.push({
      field: "file",
      code: "LARGE_FILE",
      message: "Large files may take longer to upload and process",
      severity: "warning",
    });
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata: { fileType: file.type },
  };
}

export function validateTitle(title: string | undefined): ValidationResult {
  if (!title || title.trim().length === 0)
    return { isValid: true, errors: [], warnings: [] };
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  if (title.length > CONTENT_STUDY_CONSTANTS.MAX_TITLE_LENGTH)
    errors.push({
      field: "title",
      code: "TOO_LONG",
      message: `Title must be less than ${CONTENT_STUDY_CONSTANTS.MAX_TITLE_LENGTH} characters`,
      severity: "error",
    });
  if (/[<>{}[\]]/.test(title))
    warnings.push({
      field: "title",
      code: "SPECIAL_CHARS",
      message:
        "Title contains special characters that may cause display issues",
      severity: "warning",
    });
  return { isValid: errors.length === 0, errors, warnings };
}
