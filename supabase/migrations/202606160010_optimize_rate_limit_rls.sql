ALTER POLICY rate_limit_buckets_self ON public.rate_limit_buckets
  USING (
    (
      user_id = (SELECT auth.uid())
      OR (SELECT auth.role()) = 'service_role'
    )
    AND COALESCE(((SELECT auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  );
