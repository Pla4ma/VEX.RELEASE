import { getSupabaseClient } from '../../config/supabase';

type EdgeInvokeResult = Awaited<
  ReturnType<ReturnType<typeof getSupabaseClient>['functions']['invoke']>
>;

export async function invokeEdgeFunctionWithTimeout(
  functionName: string,
  body: Record<string, unknown>,
  timeoutMs: number,
): Promise<EdgeInvokeResult> {
  let rejectTimeout: ((reason: Error) => void) | null = null;
  const timeoutPromise = new Promise<never>((_, reject) => {
    rejectTimeout = reject;
  });
  const timeoutId = setTimeout(() => {
    rejectTimeout?.(new Error('AI edge function timed out'));
  }, timeoutMs);
  try {
    return await Promise.race([
      getSupabaseClient().functions.invoke(functionName, { body }),
      timeoutPromise,
    ]);
  } finally {
    clearTimeout(timeoutId);
  }
}
