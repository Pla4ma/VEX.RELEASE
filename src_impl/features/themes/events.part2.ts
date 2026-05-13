import { ThemeEvent } from "./types";


export function deserializeThemeEvent(data: string): ThemeEventType {
  const parsed = JSON.parse(data);
  return {
    ...parsed,
    timestamp: new Date(parsed.timestamp),
  };
}