import type { NarrativeTemplate } from './narrative-templates';
import type { NarrativeBeat } from './narrative-schemas';
import { NARRATIVE_TEMPLATES } from './narrative-templates';

export function lastElement<T>(arr: T[]): T {
  return arr[arr.length - 1]!;
}

export function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export function matchTemplate(
  type: NarrativeBeat['type'],
  conditions: Record<string, unknown>,
): NarrativeTemplate | null {
  const matching = NARRATIVE_TEMPLATES.filter((t) => {
    if (t.type !== type) {return false;}
    for (const [key, value] of Object.entries(conditions)) {
      if (t.conditions[key] !== value) {return false;}
    }
    return true;
  });
  if (matching.length === 0) {return null;}
  return randomPick(matching);
}

export function pickTemplateLine(
  type: NarrativeBeat['type'],
  conditions: Record<string, unknown>,
): string {
  const template = matchTemplate(type, conditions);
  if (!template) {return 'The session continues...';}
  return randomPick(template.templates);
}
