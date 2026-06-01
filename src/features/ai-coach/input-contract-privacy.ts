import type { CoachInputContract } from './input-contract-schema';

export const FORBIDDEN_DATA_FIELDS = [
  'rawPrivateNotes',
  'secrets',
  'apiKeys',
  'passwords',
  'emailAddresses',
  'phoneNumbers',
  'realNames',
  'locationData',
  'unvalidatedStorageData',
  'rawUserInput',
  'piifield',
] as const;

export function sanitizeCoachInput(
  input: CoachInputContract,
): CoachInputContract {
  return {
    ...input,
    missionHistory: input.missionHistory.map((mission) => ({ ...mission })),
    timeContext: {
      ...input.timeContext,
      localTimezone: input.timeContext.localTimezone.match(/^[A-Za-z_/+-]+$/)
        ? input.timeContext.localTimezone
        : 'UTC',
    },
  };
}

export function containsForbiddenPII(input: unknown): boolean {
  const inputStr = JSON.stringify(input);

  return FORBIDDEN_DATA_FIELDS.some((field) =>
    inputStr.toLowerCase().includes(field.toLowerCase()),
  );
}
