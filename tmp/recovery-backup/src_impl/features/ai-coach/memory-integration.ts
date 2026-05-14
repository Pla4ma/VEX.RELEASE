import { eventBus } from '../../events';
import { createMemory } from './repository/memories';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('ai-coach:memory-integration');

/**
 * AI Coach Memory Integration
 * Connects high-performance events (Pacts, DNA, Insights) to the Coach's long-term memory.
 * This ensures the coach "remembers" the user's elite achievements and social failures.
 */

export function initializeMemoryIntegration(): void {
  // 1. Social Accountability: Pact Failures
  eventBus.subscribe('pact:failed', async (data: any) => {
    try {
      await createMemory(
        data.userId,
        'PACT_FAILURE',
        'Broken Social Pact',
        `A social commitment was failed: "${data.pactTitle}". This damaged squad trust.`,
        { 
          pactId: data.pactId, 
          squadId: data.squadId, 
          reason: data.reason,
          consequence: 'Protection Disabled'
        }
      );
    } catch (err) {
      debug.error('Failed to record pact failure memory', err);
    }
  });

  // 2. High-Status Knowledge: Elite Insights
  eventBus.subscribe('insight:unlocked', async (data: any) => {
    try {
      await createMemory(
        data.userId,
        'ELITE_INSIGHT_UNLOCKED',
        'Expert Insight Unlocked',
        `Acquired productivity knowledge: "${data.insightTitle}". Category: ${data.category}`,
        { 
          insightId: data.insightId, 
          category: data.category,
          source: data.source 
        }
      );
    } catch (err) {
      debug.error('Failed to record insight memory', err);
    }
  });

  // 3. Focus Identity: DNA Evolution
  eventBus.subscribe('focus_dna:generated', async (data: any) => {
    try {
      await createMemory(
        data.userId,
        'FOCUS_DNA_GENERATED',
        'Focus DNA Milestone',
        `The Focus DNA report confirmed a ${data.tier} identity with ${data.consistency}% consistency.`,
        { 
          tier: data.tier, 
          consistency: data.consistency, 
          depthIndex: data.depthIndex,
          peakHour: data.peakHour
        }
      );
    } catch (err) {
      debug.error('Failed to record DNA memory', err);
    }
  });

  debug.info('Memory integration initialized');
}
