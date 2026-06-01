export type SchemaClass =
  | 'core'
  | 'progressive'
  | 'disabled'
  | 'internal'
  | 'deprecated';

export interface TableClassification {
  table: string;
  class: SchemaClass;
  feature?: string;
  notes?: string;
}
