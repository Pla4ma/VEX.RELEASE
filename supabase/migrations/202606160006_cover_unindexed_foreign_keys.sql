DO $$
DECLARE
  fk_record record;
  index_name text;
BEGIN
  FOR fk_record IN
    SELECT
      n.nspname AS schema_name,
      c.relname AS table_name,
      con.conname AS constraint_name,
      array_agg(a.attname ORDER BY key_order.ordinality) AS column_names
    FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN unnest(con.conkey) WITH ORDINALITY AS key_order(attnum, ordinality) ON true
    JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = key_order.attnum
    WHERE con.contype = 'f'
      AND n.nspname = 'public'
      AND NOT EXISTS (
        SELECT 1
        FROM pg_index i
        WHERE i.indrelid = con.conrelid
          AND i.indisvalid
          AND (i.indkey::smallint[])[1:cardinality(con.conkey)] = con.conkey
      )
    GROUP BY n.nspname, c.relname, con.conname
  LOOP
    index_name := left(
      format('idx_%s_%s_fk', fk_record.table_name, array_to_string(fk_record.column_names, '_')),
      63
    );

    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS %I ON %I.%I (%s)',
      index_name,
      fk_record.schema_name,
      fk_record.table_name,
      (
        SELECT string_agg(quote_ident(column_name), ', ')
        FROM unnest(fk_record.column_names) AS column_name
      )
    );
  END LOOP;
END $$;
