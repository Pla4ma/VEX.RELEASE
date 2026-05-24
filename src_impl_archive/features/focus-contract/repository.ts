import { z } from 'zod';
import { getSupabaseClient } from '../../config/supabase';
import {
  CreateFocusContractRepositoryInputSchema,
  FocusContractRowSchema,
} from './schemas';
import type {
  CompletionStatus,
  CreateFocusContractRepositoryInput,
  FocusContract,
  FocusContractTableInsert,
  FocusContractTableUpdate,
} from './types';

export class FocusContractRepositoryError extends Error {
  constructor(operation: string, public readonly cause?: unknown) {
    super(`FocusContractRepository ${operation} failed`);
    this.name = 'FocusContractRepositoryError';
  }
}

function mapRow(row: unknown): FocusContract {
  const parsed = FocusContractRowSchema.parse(row);
  return {
    id: parsed.id,
    sessionId: parsed.session_id,
    userId: parsed.user_id,
    taskDescription: parsed.task_description,
    completionStatus: parsed.completion_status,
    reflectionAt: parsed.reflection_at,
    createdAt: parsed.created_at,
  };
}

export async function createContract(
  input: CreateFocusContractRepositoryInput,
): Promise<FocusContract> {
  try {
    const validated = CreateFocusContractRepositoryInputSchema.parse(input);
    const row: FocusContractTableInsert = {
      session_id: validated.sessionId,
      user_id: validated.userId,
      task_description: validated.taskDescription,
    };
    const { data, error } = await getSupabaseClient()
      .from('focus_contracts')
      .insert(row)
      .select('*')
      .single();

    if (error) {
      throw new FocusContractRepositoryError('createContract', error);
    }
    return mapRow(data);
  } catch (error) {
    if (error instanceof FocusContractRepositoryError) {
      throw error;
    }
    throw new FocusContractRepositoryError('createContract', error);
  }
}

export async function reflectOnContract(
  contractId: string,
  status: CompletionStatus,
): Promise<void> {
  try {
    const patch: FocusContractTableUpdate = {
      completion_status: status,
      reflection_at: new Date().toISOString(),
    };
    const { error } = await getSupabaseClient()
      .from('focus_contracts')
      .update(patch)
      .eq('id', contractId);

    if (error) {
      throw new FocusContractRepositoryError('reflectOnContract', error);
    }
  } catch (error) {
    if (error instanceof FocusContractRepositoryError) {
      throw error;
    }
    throw new FocusContractRepositoryError('reflectOnContract', error);
  }
}

export async function getContractForSession(
  sessionId: string,
  userId: string,
): Promise<FocusContract | null> {
  try {
    const { data, error } = await getSupabaseClient()
      .from('focus_contracts')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new FocusContractRepositoryError('getContractForSession', error);
    }
    return data ? mapRow(data) : null;
  } catch (error) {
    if (error instanceof FocusContractRepositoryError) {
      throw error;
    }
    throw new FocusContractRepositoryError('getContractForSession', error);
  }
}

export async function getRecentContracts(userId: string, limit: number): Promise<FocusContract[]> {
  try {
    const { data, error } = await getSupabaseClient()
      .from('focus_contracts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new FocusContractRepositoryError('getRecentContracts', error);
    }
    return z.array(FocusContractRowSchema).parse(data ?? []).map(mapRow);
  } catch (error) {
    if (error instanceof FocusContractRepositoryError) {
      throw error;
    }
    throw new FocusContractRepositoryError('getRecentContracts', error);
  }
}

export async function getContractCompletionRate(userId: string, windowDays: number): Promise<number> {
  const contracts = await getRecentContracts(userId, Math.max(3, windowDays * 3));
  const reflected = contracts.filter((contract) => contract.completionStatus !== null);
  if (reflected.length === 0) {
    return 0;
  }
  const completed = reflected.filter((contract) => contract.completionStatus === 'done').length;
  return completed / reflected.length;
}
