import { createSheet } from '@/shared/ui/create-sheet';

export const styles = createSheet({
  container: {
    flex: 1,
    backgroundColor: 'theme.colors.primary[500]',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'theme.colors.primary[500]',
  },
  loadingText: {
    marginTop: 16,
    color: 'theme.colors.primary[500]',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'theme.colors.primary[500]',
    borderBottomWidth: 1,
    borderBottomColor: 'theme.colors.primary[500]',
  },
  coachInfo: {
    flex: 1,
  },
  coachName: {
    fontSize: 20,
    fontWeight: '700',
    color: 'theme.colors.background.primary',
  },
  statusBadge: {
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    color: 'theme.colors.primary[500]',
  },
  stateIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stateLabel: {
    fontSize: 12,
    color: 'theme.colors.primary[500]',
  },
  recommendationCard: {
    margin: 16,
    padding: 16,
    backgroundColor: 'theme.colors.primary[500]',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'theme.colors.primary[500]',
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'theme.colors.primary[500]',
    marginBottom: 8,
  },
  recommendationReason: {
    fontSize: 14,
    color: 'theme.colors.primary[500]',
    marginBottom: 12,
    lineHeight: 20,
  },
  startSessionButton: {
    backgroundColor: 'theme.colors.primary[500]',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  startSessionButtonText: {
    color: 'theme.colors.background.primary',
    fontSize: 14,
    fontWeight: '600',
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 100,
  },
  messageContainer: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  coachMessageContainer: {
    justifyContent: 'flex-start',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  systemMessageContainer: {
    justifyContent: 'center',
  },
  coachAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'theme.colors.primary[500]',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  coachAvatarText: {
    fontSize: 16,
  },
  coachAvatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'theme.colors.primary[500]',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  coachAvatarTextSmall: {
    fontSize: 14,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  coachBubble: {
    backgroundColor: 'theme.colors.primary[500]',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: 'theme.colors.primary[500]',
    borderBottomRightRadius: 4,
  },
  systemBubble: {
    backgroundColor: 'theme.colors.primary[500]',
    borderRadius: 8,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  coachText: {
    color: 'theme.colors.background.primary',
  },
  userText: {
    color: 'theme.colors.background.primary',
  },
  systemText: {
    color: 'theme.colors.primary[500]',
    fontSize: 12,
    textAlign: 'center',
  },
  actionButton: {
    marginTop: 12,
    backgroundColor: 'theme.colors.primary[500]',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: 'theme.colors.background.primary',
    fontSize: 13,
    fontWeight: '600',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'theme.colors.primary[500]',
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    gap: 8,
  },
  typingText: {
    fontSize: 13,
    color: 'theme.colors.primary[500]',
  },
  errorBanner: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    backgroundColor: 'theme.colors.primary[500]',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: 'theme.colors.background.primary',
    fontSize: 13,
    flex: 1,
  },
  errorDismiss: {
    color: 'theme.colors.background.primary',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: 'theme.colors.primary[500]',
    borderTopWidth: 1,
    borderTopColor: 'theme.colors.primary[500]',
  },
  input: {
    flex: 1,
    backgroundColor: 'theme.colors.primary[500]',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 10,
    color: 'theme.colors.background.primary',
    fontSize: 15,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: 'theme.colors.primary[500]',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: 'theme.colors.primary[500]',
  },
  sendButtonText: {
    color: 'theme.colors.background.primary',
    fontSize: 14,
    fontWeight: '600',
  },
});
