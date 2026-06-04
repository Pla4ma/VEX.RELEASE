import { createSheet } from '@/shared/ui/create-sheet';
import { lightColors } from '@/theme/tokens/colors';


export const settingsStyles = createSheet({
  container: { flex: 1, backgroundColor: lightColors.surface.button },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: lightColors.text.inverse,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border.light,
  },
  backButton: { padding: 8 },
  backButtonText: { fontSize: 16, color: lightColors.semantic.primary },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: lightColors.semantic.backgroundMuted,
  },
  headerSpacer: { width: 60 },
  tabsContainer: {
    backgroundColor: lightColors.text.inverse,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border.light,
    maxHeight: 80,
  },
  tabsContent: { paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
  tab: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: lightColors.surface.button,
    marginHorizontal: 4,
  },
  activeTab: { backgroundColor: lightColors.semantic.primary },
  tabIcon: { fontSize: 20, marginBottom: 4 },
  tabLabel: { fontSize: 12, color: lightColors.text.muted },
  activeTabLabel: { color: lightColors.text.inverse, fontWeight: '500' },
  contentScroll: { flex: 1 },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: { marginTop: 16, fontSize: 16, color: lightColors.text.muted },
  errorIcon: { fontSize: 48, marginBottom: 16 },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: lightColors.semantic.danger,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: lightColors.text.muted,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: lightColors.accent.blue,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: lightColors.text.inverse,
    fontWeight: '600',
    fontSize: 14,
  },
  settingsGroup: {
    backgroundColor: lightColors.text.inverse,
    marginTop: 8,
    paddingHorizontal: 16,
  },
  actionsContainer: { padding: 16, gap: 12, marginTop: 16 },
  actionButton: {
    backgroundColor: lightColors.semantic.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: lightColors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: { backgroundColor: lightColors.error[50] },
  dangerButtonText: { color: lightColors.semantic.danger },
});
