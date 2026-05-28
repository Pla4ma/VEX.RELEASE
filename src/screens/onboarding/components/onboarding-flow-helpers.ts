export function getCoachCue(step: number): { title: string; body: string } {
  const fallback = {
    title: "We will keep the experience responsive.",
    body: "If a signal is still syncing, you will see the usable state first and deeper insights as they arrive.",
  };
  const cues = [
    {
      title: "I will tune VEX around how you focus.",
      body: "Pick the honest answer. The app adapts the first session, study surfaces, and reminders from this setup.",
    },
    {
      title: "This shapes how VEX adapts to you.",
      body: "VEX will highlight the next best action instead of making you hunt through menus.",
    },
    fallback,
  ];
  return cues[step] ?? fallback;
}
