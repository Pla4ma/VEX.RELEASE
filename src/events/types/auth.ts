/**
 * Auth Events
 */

import type { User } from '../../types/models';

export interface AuthEventDefinitions {
  'auth:login': { user: User };
  'auth:logout': { reason?: string };
  'auth:session:expired': undefined;
  'auth:token:refresh': undefined;
}
