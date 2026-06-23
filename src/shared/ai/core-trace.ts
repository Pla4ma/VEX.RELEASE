import * as Sentry from '@sentry/react-native';
import { AICoreTraceSchema, type AICoreTrace } from './core-schemas';

export function createAITrace(input: Omit<AICoreTrace, 'createdAt'>): AICoreTrace {
  return AICoreTraceSchema.parse({
    ...input,
    createdAt: new Date().toISOString(),
  });
}

export function recordAITrace(trace: AICoreTrace): void {
  Sentry.addBreadcrumb({
    category: 'ai-core',
    level: trace.policyBlocks.length > 0 ? 'warning' : 'info',
    message: trace.requestType,
    data: trace,
  });
}
