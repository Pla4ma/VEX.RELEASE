import type { SubmitContent } from './schemas.ts';

export function isOwnedStudyFilePath(fileId: string, userId: string): boolean {
  const ownerPrefix = `${userId}/`;
  if (!fileId.startsWith(ownerPrefix)) return false;
  const filename = fileId.slice(ownerPrefix.length);
  return (
    filename.length > 0 &&
    filename !== '.' &&
    filename !== '..' &&
    !filename.includes('/') &&
    /^[A-Za-z0-9._-]+$/.test(filename)
  );
}

export function buildStudyContentInsert(userId: string, request: SubmitContent) {
  const isPaste = request.type === 'PASTE';
  return {
    user_id: userId,
    source_type: request.type,
    source_url: request.type === 'YOUTUBE' ? request.url : null,
    original_filename: request.type === 'PDF' ? request.filename ?? null : null,
    storage_path: request.type === 'PDF' ? request.fileId : null,
    title: request.title ?? null,
    extracted_text: isPaste ? request.content : '',
    extracted_length: isPaste ? request.content.length : 0,
    status: isPaste ? 'EXTRACTED' : 'PENDING',
    extracted_at: isPaste ? new Date().toISOString() : null,
  };
}
