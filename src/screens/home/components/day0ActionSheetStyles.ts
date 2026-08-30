/**
 * Shared styles for the Day-0 action sheet (extracted to keep the sheet
 * component under the 200-line limit).
 */

import { borderRadius } from '../../../theme/tokens/radius';
import { spacing } from '../../../theme/tokens/spacing';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

export const sheetStyles = {
  backdrop: { flex: 1 },
  sheetContainer: {
    backgroundColor: vexLightGlass.glass.fillStrong,
    borderColor: vexLightGlass.glass.border,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    borderWidth: 1,
    padding: spacing[5],
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  headerText: { flex: 1, paddingRight: spacing[3] },
  eyebrow: {
    color: vexLightGlass.mint[700],
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    color: vexLightGlass.text.primary,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.4,
    marginTop: 2,
  },
  prompt: {
    color: vexLightGlass.text.secondary,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: spacing[3],
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
    borderColor: vexLightGlass.glass.border,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    color: vexLightGlass.text.primary,
    fontSize: 15,
    fontWeight: '500',
    minHeight: 96,
    padding: spacing[3],
    textAlignVertical: 'top',
  },
  previewLabel: {
    color: vexLightGlass.text.tertiary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginBottom: spacing[2],
    textTransform: 'uppercase',
  },
  previewBody: {
    color: vexLightGlass.text.primary,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  previewBlock: { marginTop: spacing[4] },
  saveWrap: { marginTop: spacing[5] },
  bottomPad: { height: spacing[4] },
} as const;
