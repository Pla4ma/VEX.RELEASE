/**
 * DataList — shared styles
 */
import { createSheet } from '@/shared/ui/create-sheet';


export const styles = createSheet({
  container: { flex: 1 },
  itemLoading: { opacity: 0.7 },
  itemLoadingOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  footerContainer: {
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  footerText: { marginLeft: 8 },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  toolbarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toolbarActions: { flexDirection: 'row', gap: 8 },
  toolbarAction: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
});
