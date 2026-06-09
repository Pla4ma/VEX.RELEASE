import { ONBOARDING_PROMISE_COPY } from './components/onboarding-flow-data';

export const STEP_EYEBROW: Record<number, string> = {
  0: 'STEP 1 OF 3',
  1: 'STEP 2 OF 3',
  2: 'STEP 3 OF 3',
};

export const STEP_TITLES: Record<number, { title: string; subtitle: string }> = {
  0: {
    title: 'Pick your first win',
    subtitle: ONBOARDING_PROMISE_COPY.secondary,
  },
  1: {
    title: 'Choose your motivation style',
    subtitle: 'This shapes how VEX frames progress. Change it anytime.',
  },
  2: {
    title: 'Confirm your focus mode',
    subtitle: 'VEX is ready to open around the way you actually work.',
  },
};

export const GUIDE_COPY: Record<number, { title: string; body: string }> = {
  0: {
    title: 'I will shape the first block.',
    body: 'Pick the outcome that would make today feel lighter. I will tune the next screen around it.',
  },
  1: {
    title: 'Choose the coaching tone.',
    body: 'This controls how direct, calm, or structured VEX feels when you return.',
  },
  2: {
    title: 'Lock the first mode.',
    body: 'This opens the app with one clear path. You can replay this guide later.',
  },
};
