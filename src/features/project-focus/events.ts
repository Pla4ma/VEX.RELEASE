import { ProjectThreadSchema } from './schemas';

export function validateProjectThreadEventPayload(input: unknown) {
  return ProjectThreadSchema.parse(input);
}
