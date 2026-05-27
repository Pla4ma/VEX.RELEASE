/**
 * Batch Send Helpers
 *
 * Push notification sending logic extracted from batch-send.ts.
 */

// ============================================================================
// Push Notification Sender
// ============================================================================

export interface SendPushParams {
  token: string;
  platform: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export async function sendPushNotification(params: SendPushParams): Promise<boolean> {
  const httpRequest = globalThis.fetch.bind(globalThis);
  const response = await httpRequest('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: params.token,
      title: params.title,
      body: params.body,
      data: {
        ...params.data,
        platform: params.platform,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Expo push service failed with ${response.status}`);
  }

  const payload = await response.json() as { data?: { status?: string }; errors?: unknown[] };
  return payload.data?.status === 'ok';
}
