import { FocusRunEventSchema } from "./schemas";

export function validateFocusRunEvent(input: unknown) {
  return FocusRunEventSchema.parse(input);
}
