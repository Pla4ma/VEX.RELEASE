import { getSupabaseClient } from '../../../config/supabase';
import {
  CoachPersonaSchema,
  CoachMessageTemplateSchema,
  type CoachPersona,
  type CoachMessageTemplate,
  type MessageCategory,
} from '../schemas';
import { RepositoryError } from './error';

const supabase = getSupabaseClient();

export async function fetchCoachPersonas(): Promise<CoachPersona[]> {
  const { data, error } = await supabase
    .from('coach_personas')
    .select('id,name,description,avatar_url,voice_tone,style,catchphrase,default_enabled')
    .eq('default_enabled', true)
    .order('name');
  if (error) {
    throw new RepositoryError('fetchCoachPersonas', error);
  }
  return CoachPersonaSchema.array().parse(data || []);
}

export async function fetchCoachPersona(
  personaId: string,
): Promise<CoachPersona | null> {
  const { data, error } = await supabase
    .from('coach_personas')
    .select('id,name,description,avatar_url,voice_tone,style,catchphrase,default_enabled')
    .eq('id', personaId)
    .single();
  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new RepositoryError('fetchCoachPersona', error);
  }
  return data ? CoachPersonaSchema.parse(data) : null;
}

export async function fetchMessageTemplates(
  personaId: string,
  category: MessageCategory,
): Promise<CoachMessageTemplate[]> {
  const { data, error } = await supabase
    .from('coach_message_templates')
    .select('id,persona_id,category,subcategory,priority,content,conditions,variations,cooldown_hours')
    .eq('persona_id', personaId)
    .eq('category', category)
    .order('priority', { ascending: false });
  if (error) {
    throw new RepositoryError('fetchMessageTemplates', error);
  }
  return CoachMessageTemplateSchema.array().parse(data || []);
}

export async function fetchAllMessageTemplates(
  personaId: string,
): Promise<CoachMessageTemplate[]> {
  const { data, error } = await supabase
    .from('coach_message_templates')
    .select('id,persona_id,category,subcategory,priority,content,conditions,variations,cooldown_hours')
    .eq('persona_id', personaId)
    .order('priority', { ascending: false });
  if (error) {
    throw new RepositoryError('fetchAllMessageTemplates', error);
  }
  return CoachMessageTemplateSchema.array().parse(data || []);
}
