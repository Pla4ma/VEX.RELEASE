import { http, HttpResponse, delay } from "msw";

export const sessionHandlers = [
  http.post("*/rest/v1/sessions", async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    await delay(100);
    return HttpResponse.json([
      {
        id: "session-1",
        ...body,
        status: "ACTIVE",
        created_at: new Date().toISOString(),
      },
    ]);
  }),
  http.patch("*/rest/v1/sessions", async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    await delay(50);
    return HttpResponse.json([
      { id: "session-1", ...body, updated_at: new Date().toISOString() },
    ]);
  }),
  http.get("*/rest/v1/sessions", async ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    await delay(50);
    if (status === "eq.ACTIVE") {
      return HttpResponse.json([
        {
          id: "session-1",
          user_id: "user-123",
          type: "FOCUS",
          status: "ACTIVE",
          started_at: new Date().toISOString(),
          target_duration: 1800,
        },
      ]);
    }
    return HttpResponse.json([]);
  }),
];
