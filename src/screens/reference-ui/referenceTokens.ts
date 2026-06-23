import { vexLightGlass } from '../../theme/tokens/vex-light-glass';

export const ref = {
  ink: vexLightGlass.text.primary,
  muted: 'rgba(16, 35, 31, 0.86)',
  faint: 'rgba(16, 35, 31, 0.66)',
  mint: '#12BFA0',
  mintDark: vexLightGlass.mint[800],
  softMint: vexLightGlass.mint[100],
  line: vexLightGlass.glass.borderSubtle,
  white: vexLightGlass.text.inverse,
};

export const type = {
  hero: {
    color: ref.ink,
    fontSize: 24,
    fontWeight: '800' as const,
    letterSpacing: -0.35,
    lineHeight: 29,
  },
  title: {
    color: ref.ink,
    fontSize: 17,
    fontWeight: '800' as const,
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  body: {
    color: ref.muted,
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 18,
  },
  kicker: {
    color: ref.mintDark,
    fontSize: 10,
    fontWeight: '900' as const,
    letterSpacing: 2.2,
  },
};
