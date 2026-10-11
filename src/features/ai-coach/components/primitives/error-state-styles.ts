import { vexFire } from "@/theme/tokens/vex-fire";
import { createSheet } from '@/shared/ui/create-sheet';



export const errorStateStyles = createSheet({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: vexFire.cream,
    borderRadius: 12,
    margin: 16,
  },
  degradedContainer: {
    backgroundColor: vexFire.panelSoft,
    borderWidth: 1,
    borderColor: vexFire.amber,
  },
  icon: { fontSize: 48, marginBottom: 12 },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: vexFire.backgroundRaised,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: vexFire.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  errorCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  errorCodeLabel: { fontSize: 12, color: vexFire.textMuted },
  errorCode: {
    fontSize: 12,
    color: vexFire.textMuted,
    fontFamily: 'monospace',
    backgroundColor: vexFire.ember,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  attemptsText: { fontSize: 12, color: vexFire.textMuted, marginBottom: 12 },
  actions: { gap: 8, width: '100%' },
  retryButton: {
    backgroundColor: vexFire.danger,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 120,
  },
  retryButtonText: {
    color: vexFire.cream,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: { opacity: 0.6 },
  dismissButton: { paddingVertical: 12, alignItems: 'center' },
  dismissButtonText: {
    color: vexFire.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  maxRetriesText: {
    fontSize: 12,
    color: vexFire.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  degradedBadge: {
    backgroundColor: vexFire.amber,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 12,
  },
  degradedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: vexFire.textSecondary,
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    backgroundColor: vexFire.panelSoft,
    borderRadius: 6,
    marginTop: 4,
  },
  inlineIcon: { fontSize: 14 },
  inlineText: { fontSize: 12, color: vexFire.danger, flex: 1 },
});
