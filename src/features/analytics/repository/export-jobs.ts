import { z } from 'zod';
import { getSupabaseClient, handleSupabaseError } from '../../../config/supabase';
import { ExportJobSchema } from '../schemas';

const supabase = getSupabaseClient();

export async function fetchExportJobs(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from('export_jobs')
    .select('id,user_id,status,format,data_types,date_range,filters,file_url,file_size,error_message,progress,created_at,completed_at,expires_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    throw handleSupabaseError(error);
  }
  return z.array(ExportJobSchema).parse(data ?? []);
}

export async function createExportJob(job: z.infer<typeof ExportJobSchema>) {
  const { data, error } = await supabase
    .from('export_jobs')
    .insert(job)
    .select()
    .single();
  if (error) {
    throw handleSupabaseError(error);
  }
  return ExportJobSchema.parse(data);
}

export async function updateExportJobProgress(
  jobId: string,
  progress: number,
  fileUrl?: string,
  fileSize?: number,
) {
  const updates: Record<string, unknown> = { progress };
  if (fileUrl) {
    updates.file_url = fileUrl;
    updates.file_size = fileSize;
    updates.status = 'completed';
    updates.completed_at = Date.now();
  }
  const { data, error } = await supabase
    .from('export_jobs')
    .update(updates)
    .eq('id', jobId)
    .select()
    .single();
  if (error) {
    throw handleSupabaseError(error);
  }
  return ExportJobSchema.parse(data);
}

export async function markExportJobFailed(jobId: string, errorMessage: string) {
  const { data, error } = await supabase
    .from('export_jobs')
    .update({ status: 'failed', error_message: errorMessage })
    .eq('id', jobId)
    .select()
    .single();
  if (error) {
    throw handleSupabaseError(error);
  }
  return ExportJobSchema.parse(data);
}
