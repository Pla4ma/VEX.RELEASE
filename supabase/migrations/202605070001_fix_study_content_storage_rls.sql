-- Allow authenticated users to upload and manage only their own study files.
-- The previous storage.objects policy had a USING clause but no WITH CHECK,
-- so INSERT uploads could fail even when the path matched the user id folder.

DROP POLICY IF EXISTS "Users can manage own study files" ON storage.objects;

CREATE POLICY "Users can manage own study files"
  ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'study-content'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'study-content'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
