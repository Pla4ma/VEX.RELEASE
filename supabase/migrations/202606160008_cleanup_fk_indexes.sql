CREATE INDEX IF NOT EXISTS idx_focus_contracts_session_id_fk
  ON public.focus_contracts (session_id);

CREATE INDEX IF NOT EXISTS idx_user_dungeon_attempts_dungeon_id_fk
  ON public.user_dungeon_attempts (dungeon_id);

DO $$
DECLARE
  index_record record;
BEGIN
  FOR index_record IN
    SELECT duplicate.indexrelid::regclass AS index_name
    FROM pg_index duplicate
    JOIN pg_class duplicate_class ON duplicate_class.oid = duplicate.indexrelid
    JOIN pg_class table_class ON table_class.oid = duplicate.indrelid
    JOIN pg_namespace table_schema ON table_schema.oid = table_class.relnamespace
    WHERE table_schema.nspname = 'public'
      AND duplicate_class.relname LIKE '%\_fk'
      AND NOT duplicate.indisunique
      AND EXISTS (
        SELECT 1
        FROM pg_index kept
        JOIN pg_class kept_class ON kept_class.oid = kept.indexrelid
        WHERE kept.indrelid = duplicate.indrelid
          AND kept.indexrelid <> duplicate.indexrelid
          AND kept.indkey = duplicate.indkey
          AND kept.indclass = duplicate.indclass
          AND kept.indcollation = duplicate.indcollation
          AND kept.indexprs IS NOT DISTINCT FROM duplicate.indexprs
          AND kept.indpred IS NOT DISTINCT FROM duplicate.indpred
          AND kept_class.relname NOT LIKE '%\_fk'
      )
  LOOP
    EXECUTE format('DROP INDEX IF EXISTS %s', index_record.index_name);
  END LOOP;
END $$;
