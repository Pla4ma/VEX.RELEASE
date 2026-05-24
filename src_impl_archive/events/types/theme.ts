/**
 * Theme Events
 */

import type { ThemeMode } from '../../theme/types';

export interface ThemeChangeEvent {
  mode: ThemeMode;
  previousMode?: ThemeMode;
  timestamp: number;
}

export interface ThemeEventDefinitions {
  'theme:change': ThemeChangeEvent;
  'theme:mode:set': ThemeMode;
}
