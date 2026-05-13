import { createDebugger } from "../../utils/debug";


export function createRetryStrategy(config?: Partial<RetryConfig>): RetryStrategy {
  return new RetryStrategy(config);
}

export function getRetryStrategy(config?: Partial<RetryConfig>): RetryStrategy {
  if (!strategyInstance) {
    strategyInstance = new RetryStrategy(config);
  }
  return strategyInstance;
}

export function withRetry(config?: Partial<RetryConfig>) {
  const strategy = new RetryStrategy(config);

  return function(
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args: unknown[]) {
      return strategy.execute(
        async () => originalMethod.apply(this, args),
        `${target?.constructor?.name}.${propertyKey}`
      );
    };

    return descriptor;
  };
}