export interface FocusContractEventDefinitions {
  'focus-contract:created': {
    userId: string;
    contractId: string;
    sessionId: string;
  };
  'focus-contract:reflected': {
    userId: string;
    contractId: string;
    completionStatus: string;
  };
  'focus-contract:skipped': { userId: string; sessionId: string };
}
