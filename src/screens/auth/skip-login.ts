export async function skipLogin(
  loginAnonymously: () => Promise<{ id: string } | null>,
  hydrateOnboarding: (userId: string) => Promise<void>,
  completeOnboarding: (userId?: string | null) => void,
): Promise<void> {
  const user = await loginAnonymously();
  if (!user) {
    throw new Error('Guest sign-in failed');
  }
  await hydrateOnboarding(user.id);
  completeOnboarding(user.id);
}
