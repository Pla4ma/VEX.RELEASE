export function buildGuardrailReply(userMessage: string): string | null {
  const lower = userMessage.trim().toLowerCase();
  if (asksModelIdentity(lower)) {
    return 'I am VEX inside the app: a focus coach for clean starts, tight sessions, and follow-through.';
  }
  if (/^(hi|hello|hey|yo|sup|what'?s up)[!.\s]*$/i.test(userMessage.trim())) {
    return 'Hey. Pick one thing worth starting, and I will help you make the first move clean.';
  }
  return null;
}

export function asksModelIdentity(lowerMessage: string): boolean {
  return lowerMessage.includes('what model') ||
    lowerMessage.includes('which model') ||
    lowerMessage.includes('who made you') ||
    lowerMessage.includes('what ai') ||
    lowerMessage.includes('ai model') ||
    lowerMessage.includes('real ai') ||
    lowerMessage.includes('real model') ||
    lowerMessage.includes('tell me the real') ||
    lowerMessage.includes('are you gpt') ||
    lowerMessage.includes('are you llama') ||
    lowerMessage.includes('are you mistral') ||
    lowerMessage.includes('are you deepseek');
}
