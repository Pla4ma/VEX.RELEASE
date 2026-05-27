describe("Supabase config", () => {
  const originalJestWorkerId = process.env.JEST_WORKER_ID;
  const originalSupabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const originalSupabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  afterEach(() => {
    jest.resetModules();
    if (originalJestWorkerId === undefined) {
      delete process.env.JEST_WORKER_ID;
    } else {
      process.env.JEST_WORKER_ID = originalJestWorkerId;
    }
    if (originalSupabaseUrl === undefined) {
      delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    } else {
      process.env.EXPO_PUBLIC_SUPABASE_URL = originalSupabaseUrl;
    }
    if (originalSupabaseAnonKey === undefined) {
      delete process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    } else {
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = originalSupabaseAnonKey;
    }
  });

  it("throws outside Jest when Supabase public credentials are missing", () => {
    delete process.env.JEST_WORKER_ID;
    process.env.EXPO_PUBLIC_SUPABASE_URL = "";
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = "";

    jest.resetModules();

    expect(() => {
      require("../supabase");
    }).toThrow("Missing Supabase configuration");
  });
});
