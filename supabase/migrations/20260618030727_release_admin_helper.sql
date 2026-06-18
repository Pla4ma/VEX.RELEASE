CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.user_id = auth.uid()
      AND au.role IN ('admin', 'super_admin')
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin_user() FROM public, anon, authenticated;
