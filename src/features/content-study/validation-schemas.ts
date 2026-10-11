import { z } from 'zod';
import { CONTENT_STUDY_CONSTANTS } from './types';
import { isValidYoutubeStudyUrl } from './youtube-url';

export const YouTubeUrlSchema = z.string().refine(
  isValidYoutubeStudyUrl,
  { message: 'Invalid YouTube URL format' },
);

export const FileUploadSchema = z.object({
  uri: z.string().min(1, 'File URI is required'),
  name: z.string().min(1, 'File name is required'),
  size: z
    .number()
    .max(
      CONTENT_STUDY_CONSTANTS.MAX_PDF_SIZE,
      `File size must be less than ${CONTENT_STUDY_CONSTANTS.MAX_PDF_SIZE / (1024 * 1024)}MB`,
    ),
  type: z.enum([
    'application/pdf',
    'text/plain',
    'text/markdown',
  ] as const),
});

export const PastedTextSchema = z
  .string()
  .min(
    CONTENT_STUDY_CONSTANTS.MIN_PASTE_LENGTH,
    `Content must be at least ${CONTENT_STUDY_CONSTANTS.MIN_PASTE_LENGTH} characters`,
  )
  .max(
    CONTENT_STUDY_CONSTANTS.MAX_PASTE_LENGTH,
    `Content must be less than ${CONTENT_STUDY_CONSTANTS.MAX_PASTE_LENGTH} characters`,
  );

export const TitleSchema = z
  .string()
  .max(CONTENT_STUDY_CONSTANTS.MAX_TITLE_LENGTH, 'Title is too long')
  .optional();
