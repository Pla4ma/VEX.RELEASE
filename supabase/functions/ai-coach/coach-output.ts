import { extractJsonObject, stripAiMarkdown } from '../_shared/vex-ai-output.ts';

export function readCoachPayload(text: string): unknown {
  const matched = extractJsonObject(text);
  if (matched) {return JSON.parse(matched) as unknown;}
  if (isLowQualityCoachText(text)) {throw new Error('LLM returned low-quality coach output');}
  const message = normalizeCoachMessage(text);
  if (isPromptEcho(message)) {throw new Error('LLM echoed prompt instead of answering');}
  if (isLowQualityCoachText(message)) {throw new Error('LLM returned low-quality coach output');}
  return { message, tone: 'calm', urgency: 'low' };
}

export function normalizeCoachMessage(text: string): string {
  return stripWrappingQuotes(
    stripAiMarkdown(text)
      .replace(/\s+/g, ' ')
      .replace(/let'?s get back to the game ?plan[.!]?/gi, 'Pick one small next move.')
      .replace(/let'?s get started on our first match[.!]?/gi, 'Start with one clear target.')
      .replace(/building our team'?s skills/gi, 'building your focus')
      .replace(/vex robotics competition coach/gi, 'VEX coach')
      .replace(/vex game mechanics and rules/gi, 'your current focus routine')
      .replace(/our team'?s communication system/gi, 'VEX')
      .replace(/questions and concerns/gi, 'questions')
      .replace(/\b(sensors?|motors?|robots?|robotics|competition|tournament)\b/gi, 'focus')
      .replace(/welcome to the team,?\s*/gi, '')
      .trim(),
  ).slice(0, 360).trim();
}

export function isPromptEcho(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes('analyze the request') ||
    lower.includes('analyze the user') ||
    lower.includes('user context:') ||
    lower.includes('allowed actions') ||
    lower.includes('constraints:') ||
    lower.includes('persona:') ||
    lower.includes('valid json only') ||
    lower.includes('user said:') ||
    lower.includes('vex coach reply') ||
    lower.includes('vex robotics competition') ||
    lower.includes('what model');
}

function isLowQualityCoachText(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes('current understanding') ||
    lower.includes('game mechanics') ||
    lower.includes('instant support') ||
    lower.includes('communication system') ||
    lower.includes('as an ai') ||
    lower.includes('i am an ai') ||
    lower.includes('language model') ||
    lower.includes('gpt') ||
    lower.includes('chatgpt') ||
    lower.includes('llama') ||
    lower.includes('mistral') ||
    lower.includes('deepseek') ||
    lower.includes('gemini') ||
    lower.includes('openai') ||
    lower.includes('openrouter') ||
    lower.includes('how can i assist') ||
    lower.includes('questions and concerns') ||
    lower.includes('get started with the fundamentals');
}

function stripWrappingQuotes(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length < 2) {return trimmed;}
  const first = trimmed[0];
  const last = trimmed[trimmed.length - 1];
  const wrapped = (first === '"' && last === '"') ||
    (first === "'" && last === "'") ||
    (first === '“' && last === '”');
  return wrapped ? trimmed.slice(1, -1).trim() : trimmed;
}
