DROP POLICY IF EXISTS challenges_write_admin ON public.challenges;
DROP POLICY IF EXISTS feature_flags_write_admin ON public.feature_flags;
DROP POLICY IF EXISTS liveops_write_admin ON public.liveops_config;
DROP POLICY IF EXISTS seasons_write_admin ON public.seasons;
DROP POLICY IF EXISTS session_stories_owner_all ON public.session_stories;
DROP POLICY IF EXISTS seller_modify ON public.trading_listings;

CREATE POLICY challenges_insert_admin ON public.challenges
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IN (SELECT user_id FROM public.admin_users) AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false);
CREATE POLICY challenges_update_admin ON public.challenges
  FOR UPDATE TO authenticated USING (auth.uid() IN (SELECT user_id FROM public.admin_users) AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false)
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.admin_users) AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false);
CREATE POLICY challenges_delete_admin ON public.challenges
  FOR DELETE TO authenticated USING (auth.uid() IN (SELECT user_id FROM public.admin_users) AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false);

CREATE POLICY feature_flags_insert_admin ON public.feature_flags
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IN (SELECT user_id FROM public.admin_users) AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false);
CREATE POLICY feature_flags_update_admin ON public.feature_flags
  FOR UPDATE TO authenticated USING (auth.uid() IN (SELECT user_id FROM public.admin_users) AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false)
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.admin_users) AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false);
CREATE POLICY feature_flags_delete_admin ON public.feature_flags
  FOR DELETE TO authenticated USING (auth.uid() IN (SELECT user_id FROM public.admin_users) AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false);

CREATE POLICY liveops_insert_admin ON public.liveops_config
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IN (SELECT user_id FROM public.admin_users) AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false);
CREATE POLICY liveops_update_admin ON public.liveops_config
  FOR UPDATE TO authenticated USING (auth.uid() IN (SELECT user_id FROM public.admin_users) AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false)
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.admin_users) AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false);
CREATE POLICY liveops_delete_admin ON public.liveops_config
  FOR DELETE TO authenticated USING (auth.uid() IN (SELECT user_id FROM public.admin_users) AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false);

CREATE POLICY seasons_insert_admin ON public.seasons
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IN (SELECT user_id FROM public.admin_users) AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false);
CREATE POLICY seasons_update_admin ON public.seasons
  FOR UPDATE TO authenticated USING (auth.uid() IN (SELECT user_id FROM public.admin_users) AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false)
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.admin_users) AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false);
CREATE POLICY seasons_delete_admin ON public.seasons
  FOR DELETE TO authenticated USING (auth.uid() IN (SELECT user_id FROM public.admin_users) AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false);

CREATE POLICY trading_listings_insert_seller ON public.trading_listings
  FOR INSERT TO authenticated WITH CHECK ((auth.uid())::text = (seller_id)::text AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false);
CREATE POLICY trading_listings_update_seller ON public.trading_listings
  FOR UPDATE TO authenticated USING ((auth.uid())::text = (seller_id)::text AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false)
  WITH CHECK ((auth.uid())::text = (seller_id)::text AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false);
CREATE POLICY trading_listings_delete_seller ON public.trading_listings
  FOR DELETE TO authenticated USING ((auth.uid())::text = (seller_id)::text AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false);
