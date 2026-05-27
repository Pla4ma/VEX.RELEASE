import { useQuery } from "@tanstack/react-query";

export function useRewards() {
  return useQuery({
    queryFn: () => Promise.resolve([]),
    queryKey: ["rewards"],
  });
}

export function useVaultRewards(userId: string | null) {
  return useQuery({
    enabled: Boolean(userId),
    queryFn: () => Promise.resolve([]),
    queryKey: ["vault-rewards", userId],
  });
}
