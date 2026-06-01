export { RepositoryError } from '../../../lib/repository/error-handling';

/** Re-export singleton from canonical source to avoid stale module-level references */
export { supabase } from '../../../config/supabase';
