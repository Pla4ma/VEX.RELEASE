ALTER TABLE public.companion_promises
  ADD COLUMN IF NOT EXISTS target_date DATE,
  ADD COLUMN IF NOT EXISTS target_duration_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS target_mode TEXT;

UPDATE public.companion_promises
SET
  target_date = COALESCE(target_date, promised_for),
  target_duration_minutes = COALESCE(target_duration_minutes, recommended_duration_minutes),
  target_mode = COALESCE(target_mode, recommended_mode)
WHERE
  target_date IS NULL
  OR target_duration_minutes IS NULL
  OR target_mode IS NULL;

ALTER TABLE public.companion_promises
  ALTER COLUMN target_date SET NOT NULL,
  ALTER COLUMN target_duration_minutes SET NOT NULL,
  ALTER COLUMN target_mode SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'companion_promises_target_duration_minutes_check'
  ) THEN
    ALTER TABLE public.companion_promises
      ADD CONSTRAINT companion_promises_target_duration_minutes_check
      CHECK (target_duration_minutes > 0);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.sync_companion_promises_phase3_fields()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.promised_for := COALESCE(NEW.promised_for, NEW.target_date);
  NEW.target_date := COALESCE(NEW.target_date, NEW.promised_for);
  NEW.recommended_duration_minutes := COALESCE(
    NEW.recommended_duration_minutes,
    NEW.target_duration_minutes
  );
  NEW.target_duration_minutes := COALESCE(
    NEW.target_duration_minutes,
    NEW.recommended_duration_minutes
  );
  NEW.recommended_mode := COALESCE(NEW.recommended_mode, NEW.target_mode);
  NEW.target_mode := COALESCE(NEW.target_mode, NEW.recommended_mode);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS companion_promises_phase3_sync
ON public.companion_promises;

CREATE TRIGGER companion_promises_phase3_sync
BEFORE INSERT OR UPDATE ON public.companion_promises
FOR EACH ROW
EXECUTE FUNCTION public.sync_companion_promises_phase3_fields();
