import { parseStudyContentAccessRows } from '../study-access.ts';
import { normalizeStudyContentJson } from '../database.ts';

Deno.test('maps the Postgres RPC row into the Edge Function contract', () => {
  const result = parseStudyContentAccessRows([
    { can_upload: true, fallback_label: null },
  ]);
  if (!result.canUpload || result.fallbackLabel !== null) {
    throw new Error('Study access RPC row was not mapped to camelCase');
  }
});

Deno.test('rejects malformed and empty RPC responses', () => {
  for (const response of [[], [{ can_upload: 'yes', fallback_label: null }]]) {
    let rejected = false;
    try {
      parseStudyContentAccessRows(response);
    } catch {
      rejected = true;
    }
    if (!rejected) throw new Error('Invalid Study access response was accepted');
  }
});

Deno.test('normalizes domain payloads before storing them in Supabase JSON columns', () => {
  const normalized = normalizeStudyContentJson([
    { id: 'task-1', optional: undefined },
  ]);
  if (JSON.stringify(normalized) !== '[{"id":"task-1"}]') {
    throw new Error('Study payload did not normalize to valid JSON');
  }
});

Deno.test('rejects values that cannot be serialized as JSON', () => {
  let rejected = false;
  try {
    normalizeStudyContentJson(undefined);
  } catch {
    rejected = true;
  }
  if (!rejected) throw new Error('Non-serializable Study payload was accepted');
});
