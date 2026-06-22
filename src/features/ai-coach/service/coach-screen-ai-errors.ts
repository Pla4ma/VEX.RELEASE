interface CoachAiErrorContext {
  functionName: string;
  hasSession: boolean;
  userId: string;
}

export async function readFunctionErrorMessage(
  error: unknown,
  context: CoachAiErrorContext,
): Promise<string> {
  if (isRecord(error) && isResponseLike(error.context)) {
    const body = await readResponseBody(error.context);
    return [
      'Coach AI edge call failed.',
      'function=' + context.functionName,
      'status=' + error.context.status,
      'hasSession=' + String(context.hasSession),
      'userId=' + context.userId,
      'body=' + body,
    ].join(' ');
  }
  const message = error instanceof Error ? error.message : 'unknown error';
  return [
    'Coach AI request failed.',
    'function=' + context.functionName,
    'hasSession=' + String(context.hasSession),
    'userId=' + context.userId,
    'error=' + message,
  ].join(' ');
}

async function readResponseBody(response: Response): Promise<string> {
  const text = await response.clone().text().catch(() => '');
  return text.slice(0, 500);
}

function isResponseLike(value: unknown): value is Response {
  return (
    isRecord(value) &&
    typeof value.clone === 'function' &&
    typeof value.status === 'number'
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
