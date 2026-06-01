export type {
  SchemaClass,
  TableClassification,
} from './schema-classification-data';
export { SCHEMA_CLASSIFICATION_DATA } from './schema-classification-data';

import type {
  SchemaClass,
  TableClassification,
} from './schema-classification-data';
import { SCHEMA_CLASSIFICATION_DATA } from './schema-classification-data';

export const SCHEMA_CLASSIFICATION: TableClassification[] =
  SCHEMA_CLASSIFICATION_DATA;

export function getTableClass(table: string): SchemaClass {
  return (
    SCHEMA_CLASSIFICATION_DATA.find((t) => t.table === table)?.class ?? 'core'
  );
}

export function isTableQueryable(
  table: string,
  unlockedFeatures: Set<string>,
): boolean {
  const entry = SCHEMA_CLASSIFICATION_DATA.find((t) => t.table === table);
  if (!entry) {return true;}
  if (entry.class === 'core') {return true;}
  if (
    entry.class === 'disabled' ||
    entry.class === 'deprecated' ||
    entry.class === 'internal'
  )
    {return false;}
  if (entry.class === 'progressive' && entry.feature)
    {return unlockedFeatures.has(entry.feature);}
  return false;
}
