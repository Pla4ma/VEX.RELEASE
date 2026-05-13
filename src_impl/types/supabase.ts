type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]
export const Constants = {
  public: {
    Enums: {},
  },
} as const;

export * from "./supabase.types";
