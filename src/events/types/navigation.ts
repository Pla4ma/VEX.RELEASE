/**
 * Navigation Events
 */

import type { NavigationEvent, RouteName } from '../../types/navigation';

export interface NavigationEventDefinitions {
  'navigation:route:change': NavigationEvent;
  'navigation:back': { from: RouteName; to?: RouteName };
  'navigation:deepLink': { url: string; params?: Record<string, string> };
  'navigation:navigate': { screen: string; params?: Record<string, unknown> };
}
