/**
 * checkConditions — extracted from message-generator.ts to break the require
 * cycle: message-generator.ts <-> intervention-evaluator.ts both need it, so
 * it lives in its own leaf module.
 */
export function checkConditions(
  conditions: {
    type?: string;
    operator: string;
    value?: unknown;
    field?: string;
  }[],
  context: Record<string, unknown>,
): boolean {
  return conditions.every((condition) => {
    const key = condition.type ?? condition.field;
    if (!key) {
      return false;
    }
    const contextValue = context[key];
    if (contextValue === undefined) {
      return false;
    }
    switch (condition.operator) {
      case 'eq':
        return contextValue === condition.value;
      case 'gt':
        return Number(contextValue) > Number(condition.value);
      case 'lt':
        return Number(contextValue) < Number(condition.value);
      case 'gte':
        return Number(contextValue) >= Number(condition.value);
      case 'lte':
        return Number(contextValue) <= Number(condition.value);
      case 'in':
        return (
          Array.isArray(condition.value) &&
          condition.value.includes(contextValue)
        );
      default:
        return false;
    }
  });
}
