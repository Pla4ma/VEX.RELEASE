import { eventBus } from '../../events';
import type { CompanionPromise } from './types';

export function publishPromiseCreated(promise: CompanionPromise): void {
  eventBus.publish('companion-promise:created', {
    promiseId: promise.id,
    userId: promise.userId,
  });
}

export function publishPromiseFulfilled(promise: CompanionPromise): void {
  eventBus.publish('companion-promise:fulfilled', {
    promiseId: promise.id,
    userId: promise.userId,
  });
}

export function publishPromiseMissed(promise: CompanionPromise): void {
  eventBus.publish('companion-promise:missed', {
    promiseId: promise.id,
    userId: promise.userId,
  });
}

export function publishPromiseRecovered(promise: CompanionPromise): void {
  eventBus.publish('companion-promise:recovered', {
    promiseId: promise.id,
    userId: promise.userId,
  });
}
