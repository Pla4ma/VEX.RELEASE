export const STEP_EYEBROW: Record<number, string> = {
  0: 'STEP 1 OF 3',
  1: 'STEP 2 OF 3',
  2: 'STEP 3 OF 3',
};

export const STEP_TITLES: Record<number, { title: string; subtitle: string }> = {
  0: {
    title: 'Pick your first win',
    subtitle: 'Choose what would make today feel lighter.',
  },
  1: {
    title: 'Choose your rhythm',
    subtitle: 'VEX will tune the setup to your energy.',
  },
  2: {
    title: 'Confirm your mode',
    subtitle: 'You can change this anytime.',
  },
};

export const MASCOT_COPY: Record<
  number,
  { mood: 'pointing' | 'thinking' | 'encouraging'; message: string }
> = {
  0: {
    mood: 'pointing',
    message: 'Pick one. I shape your first block.',
  },
  1: {
    mood: 'thinking',
    message: 'I adapt from your answer.',
  },
  2: {
    mood: 'encouraging',
    message: 'Lock the mode. I guide first block.',
  },
};

export const GUIDE_COPY: Record<number, { title: string; body: string }> = {
  0: {
    title: 'I shape the first block.',
    body: 'Pick the outcome that would make today feel lighter.',
  },
  1: {
    title: 'Choose the coaching tone.',
    body: 'This controls how direct, calm, or structured VEX feels.',
  },
  2: {
    title: 'Lock the first mode.',
    body: 'This opens the app with one clear path.',
  },
};
