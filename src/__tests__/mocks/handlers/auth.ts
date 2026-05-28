import { http, HttpResponse, delay } from "msw";

export const authHandlers = [
  http.post("*/auth/v1/token", async ({ request }) => {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };
    if (!body.email || !body.password) {
      return HttpResponse.json(
        { error: "Email and password required" },
        { status: 400 },
      );
    }
    if (body.password === "wrong-password") {
      return HttpResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }
    await delay(100);
    return HttpResponse.json({
      access_token: "mock-access-token",
      refresh_token: "mock-refresh-token",
      user: {
        id: "user-123",
        email: body.email,
        user_metadata: { name: "Test User" },
      },
    });
  }),
  http.post("*/auth/v1/signup", async ({ request }) => {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };
    if (!body.email || !body.password) {
      return HttpResponse.json(
        { error: "Email and password required" },
        { status: 400 },
      );
    }
    await delay(100);
    return HttpResponse.json({
      user: {
        id: "new-user-123",
        email: body.email,
        created_at: new Date().toISOString(),
      },
    });
  }),
  http.post("*/auth/v1/logout", async () => {
    await delay(50);
    return HttpResponse.json({ success: true });
  }),
  http.get("*/auth/v1/user", async ({ request }) => {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.includes("Bearer")) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return HttpResponse.json({
      id: "user-123",
      email: "test@example.com",
      user_metadata: { name: "Test User" },
    });
  }),
];
