import { createSheet } from '@/shared/ui/create-sheet';

export const styles = createSheet({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 16 },
  centered: { alignItems: 'center', paddingVertical: 40 },

  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  headerCopy: { flex: 1, gap: 8 },
  crownBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  crownIcon: { fontSize: 28 },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    lineHeight: 38,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },

  // Social Proof
  socialProofBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  socialProofIcon: { fontSize: 16 },

  // Value Card
  valueCard: {
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  valueTitle: {
    color: 'theme.colors.background.primary',
    fontSize: 16,
    fontWeight: '700',
  },
  valueGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  valueItem: { alignItems: 'center' },
  valueNumber: {
    color: 'theme.colors.background.primary',
    fontSize: 28,
    fontWeight: '800',
  },
  valueLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  valueDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  valueFootnote: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    textAlign: 'center',
  },

  // Plans
  planSection: { gap: 12 },
  planSectionTitle: { marginBottom: 4 },
  planCard: {
    borderRadius: 20,
    padding: 18,
  },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bestValueBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bestValueText: {
    color: 'theme.colors.text.primary',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  flexibleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  flexibleText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  trialText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },

  // Benefits
  benefitsSection: { gap: 10, marginTop: 8 },
  benefitsSectionTitle: { marginBottom: 4 },
  benefitCard: {
    borderRadius: 16,
    padding: 14,
  },
  benefitRow: {
    flexDirection: 'row',
    gap: 12,
  },
  benefitIcon: { fontSize: 28 },
  benefitContent: { flex: 1, gap: 2 },
  benefitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  highlightBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  highlightBadgeText: {
    color: 'theme.colors.text.primary',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Footer
  footerActions: {
    flexDirection: 'column',
    gap: 12,
    marginTop: 8,
  },
  terms: {
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 16,
  },
});
