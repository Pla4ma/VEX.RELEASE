import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.103.3';
import type { ContentStudyDatabase } from './database.ts';

export type ContentStudyClient = SupabaseClient<ContentStudyDatabase>;
