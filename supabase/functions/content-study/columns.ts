/**
 * Content Study — Shared Column Definitions
 *
 * Centralizes SELECT column lists to prevent drift between handlers.
 * Adding a new column? Add it HERE, not in the handler files.
 */

export const STUDY_CONTENT_COLUMNS = [
  'id',
  'user_id',
  'source_type',
  'source_url',
  'original_filename',
  'storage_path',
  'title',
  'extracted_text',
  'extracted_length',
  'language',
  'user_edited_text',
  'is_user_edited',
  'status',
  'error_message',
  'generation_count_today',
  'last_generation_date',
  'deleted_at',
  'created_at',
  'updated_at',
  'extracted_at',
] as const;

export const STUDY_CONTENT_COLUMNS_STR = STUDY_CONTENT_COLUMNS.join(', ');

/**
 * Study content columns PLUS the study_generations join.
 * Use this when the caller needs the generation data too.
 */
export const STUDY_CONTENT_WITH_GENERATIONS = [
  ...STUDY_CONTENT_COLUMNS,
  'study_generations(id, content_id, user_id, model, generation_version, processing_time_ms, summary, key_concepts, tasks, quiz_items, session_plan, user_rating, was_helpful, times_used, last_used_at, is_llm_generated, deleted_at, created_at, updated_at)',
].join(', ');
