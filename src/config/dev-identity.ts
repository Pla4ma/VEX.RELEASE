export const DEV_BYPASS_USER_ID = '00000000-0000-4000-8000-000000000001';

export function canSkipLogin(
  development: boolean,
  environment: string | undefined,
  enabled: string | undefined,
): boolean {
  if (environment === 'production') return false;
  return development || (environment === 'staging' && enabled === '1');
}
