import type { EventMetadata } from './types';

export function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function createEventMetadata(source: string): EventMetadata {
  return { source, version: '1.0.0', platform: getPlatform() };
}

function getPlatform(): string {
  if (typeof window !== 'undefined') {
    return 'web';
  }
  return 'unknown';
}
