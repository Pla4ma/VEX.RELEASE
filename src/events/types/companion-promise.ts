export interface CompanionPromiseEventDefinitions {
  'companion-promise:created': { userId: string; promiseId: string; timestamp?: number };
  'companion-promise:fulfilled': { userId: string; promiseId: string; timestamp?: number };
  'companion-promise:missed': { userId: string; promiseId: string; timestamp?: number };
  'companion-promise:recovered': { userId: string; promiseId: string; timestamp?: number };
}
