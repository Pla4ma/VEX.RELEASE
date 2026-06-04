import { getSupabaseClient } from '../../../config/supabase';
import {
  InterventionRuleSchema,
  InterventionExecutionSchema,
  type InterventionRule,
  type InterventionExecution,
  type TriggerType,
} from '../schemas';
import { RepositoryError } from './error';
import { tableColumns } from '../../../lib/repository/tableColumns';

const supabase = getSupabaseClient();

export async function fetchInterventionRules(): Promise<InterventionRule[]> {
  const { data, error } = await supabase
    .from('intervention_rules')
    .select('id,name,trigger_type,trigger_threshold,conditions,action_type,message_template_id,delivery_method,delay_minutes,priority,cooldown_hours,max_per_day,is_active')
    .eq('is_active', true)
    .order('priority', { ascending: false });
  if (error) {
    throw new RepositoryError('fetchInterventionRules', error);
  }
  return InterventionRuleSchema.array().parse(data || []);
}

export async function fetchInterventionRulesByTrigger(
  triggerType: TriggerType,
): Promise<InterventionRule[]> {
  const { data, error } = await supabase
    .from('intervention_rules')
    .select('id,name,trigger_type,trigger_threshold,conditions,action_type,message_template_id,delivery_method,delay_minutes,priority,cooldown_hours,max_per_day,is_active')
    .eq('is_active', true)
    .eq('trigger_type', triggerType)
    .order('priority', { ascending: false });
  if (error) {
    throw new RepositoryError('fetchInterventionRulesByTrigger', error);
  }
  return InterventionRuleSchema.array().parse(data || []);
}

export async function createInterventionExecution(
  execution: InterventionExecution,
): Promise<InterventionExecution> {
  const { data, error } = await supabase
    .from('intervention_executions')
    .insert({
      id: execution.id,
      user_id: execution.userId,
      rule_id: execution.ruleId,
      trigger_type: execution.triggerType,
      triggered_at: execution.triggeredAt,
      executed_at: execution.executedAt,
      status: execution.status,
      result: execution.result,
    })
    .select(tableColumns('intervention_executions'))
    .single();
  if (error) {
    throw new RepositoryError('createInterventionExecution', error);
  }
  return InterventionExecutionSchema.parse(data);
}

export async function updateInterventionExecution(
  executionId: string,
  status: string,
  result?: Record<string, unknown>,
): Promise<InterventionExecution> {
  const updates: Record<string, unknown> = { status };
  if (result) {
    updates.result = result;
  }
  const { data, error } = await supabase
    .from('intervention_executions')
    .update(updates)
    .eq('id', executionId)
    .select(tableColumns('intervention_executions'))
    .single();
  if (error) {
    throw new RepositoryError('updateInterventionExecution', error);
  }
  return InterventionExecutionSchema.parse(data);
}

export async function fetchTodaysInterventionExecutions(
  userId: string,
): Promise<InterventionExecution[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfDay = today.getTime();
  const { data, error } = await supabase
    .from('intervention_executions')
    .select('id,user_id,rule_id,trigger_type,triggered_at,executed_at,status,result,message_id,user_response,effectiveness')
    .eq('user_id', userId)
    .gte('triggered_at', startOfDay)
    .order('triggered_at', { ascending: false });
  if (error) {
    throw new RepositoryError('fetchTodaysInterventionExecutions', error);
  }
  return InterventionExecutionSchema.array().parse(data || []);
}

export async function wasRuleTriggeredRecently(
  userId: string,
  ruleId: string,
  hours: number = 24,
): Promise<boolean> {
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  const { count, error } = await supabase
    .from('intervention_executions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('rule_id', ruleId)
    .gte('triggered_at', cutoff);
  if (error) {
    throw new RepositoryError('wasRuleTriggeredRecently', error);
  }
  return (count || 0) > 0;
}
