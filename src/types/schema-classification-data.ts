export type {
  SchemaClass,
  TableClassification,
} from "./schema-classification-types";
export { CORE_TABLES } from "./schema-core-tables";
export { PROGRESSIVE_TABLES } from "./schema-progressive-tables";
export { PROGRESSIVE_EXTENSION_TABLES } from "./schema-progressive-extensions";
export { ARCHIVED_TABLES } from "./schema-archived-tables";

import type { TableClassification } from "./schema-classification-types";
import { CORE_TABLES } from "./schema-core-tables";
import { PROGRESSIVE_TABLES } from "./schema-progressive-tables";
import { PROGRESSIVE_EXTENSION_TABLES } from "./schema-progressive-extensions";
import { ARCHIVED_TABLES } from "./schema-archived-tables";

export const SCHEMA_CLASSIFICATION_DATA: TableClassification[] = [
  ...CORE_TABLES,
  ...PROGRESSIVE_TABLES,
  ...PROGRESSIVE_EXTENSION_TABLES,
  ...ARCHIVED_TABLES,
];
