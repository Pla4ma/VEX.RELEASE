/**
 * Account Deletion Events
 */

export interface AccountDeletionEventDefinitions {
  'account-deletion:completed': {
    result: unknown;
    timestamp: number;
  };
}
