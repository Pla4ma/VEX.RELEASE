import * as Sentry from '@sentry/react-native';
import { atomicAddXpRpc, type AtomicXpRpcResult } from './repository';
import type { AddXpInput } from './schemas';

export type { AtomicXpRpcResult };

export async function tryAtomicAddXp(
  userId: string,
  amount: number,
  input: AddXpInput,
  idempotencyKey: string | undefined,
): Promise<AtomicXpRpcResult | null> {
  try {
    const { data, error } = await atomicAddXpRpc({
      userId,
      amount,
      source: input.source,
      sessionId: input.sessionId,
      idempotencyKey,
      metadata: input.metadata,
    });

    if (error) {
      Sentry.captureException(error, {
        tags: { operation: 'atomic_add_xp_rpc' },
      });
      return null;
    }

    return data;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { operation: 'tryAtomicAddXp' },
    });
    return null;
  }
}
