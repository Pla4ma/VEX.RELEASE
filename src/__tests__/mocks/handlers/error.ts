import { http, HttpResponse, delay } from "msw";

export const errorHandlers = [
  http.get("*/network-error", async () => {
    return HttpResponse.error();
  }),
  http.get("*/timeout", async () => {
    await delay(30000);
    return HttpResponse.json({});
  }),
  http.get("*/rate-limit", async () => {
    return HttpResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }),
  http.get("*/server-error", async () => {
    return HttpResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }),
  http.get("*/auth-error", async () => {
    return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
  }),
];
