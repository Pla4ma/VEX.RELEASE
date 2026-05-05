/**
 * Document Hub
 *
 * Central place for all study materials with progress tracking.
 * Phase 1: Content Study Unification
 */

import React, { useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../../theme';
import { Icon } from '../../components/Icon';
import { ProgressBar } from '../../components/ProgressBar';
import * as repository from './repository';
import type { ContentDocument } from './types';

interface DocumentHubProps {
  userId: string;
  onDocumentPress: (document: ContentDocument) => void;
  onContinueReading: (documentId: string) => void;
  onStartStudySession: (documentId: string) => void;
}

const DOCUMENTS_QUERY_KEY = (userId: string) => ['documents', userId];

export const DocumentHub: React.FC<DocumentHubProps> = ({
  userId,
  onDocumentPress,
  onContinueReading,
  onStartStudySession,
}) => {
  const theme = useTheme();
  const queryClient = useQueryClient();

  // Fetch user's documents
  const { data: documents, isLoading } = useQuery({
    queryKey: DOCUMENTS_QUERY_KEY(userId),
    queryFn: () => repository.fetchUserDocuments(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (documentId: string) => repository.deleteDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY(userId) });
    },
  });

  // Categorize documents
  const categorized = useMemo(() => {
    if (!documents) return { inProgress: [], completed: [], notStarted: [] };

    return {
      inProgress: documents.filter(d => d.progressPercent > 0 && d.progressPercent < 100),
      completed: documents.filter(d => d.progressPercent === 100),
      notStarted: documents.filter(d => d.progressPercent === 0),
    };
  }, [documents]);

  // Get document icon based on type
  const getDocumentIcon = useCallback((type: string) => {
    const icons: Record<string, string> = {
      PDF: 'file-text',
      DOC: 'file-text',
      TEXT: 'file-text',
      URL: 'link',
      OTHER: 'file',
    };
    return icons[type] || 'file';
  }, []);

  // Render document card
  const renderDocumentCard = (doc: ContentDocument) => {
    const isInProgress = doc.progressPercent > 0 && doc.progressPercent < 100;
    const isCompleted = doc.progressPercent === 100;

    return (
      <TouchableOpacity
        key={doc.id}
        onPress={() => onDocumentPress(doc)}
        style={{
          backgroundColor: theme.colors.background.card,
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: isInProgress ? theme.colors.primary.DEFAULT : theme.colors.border.light,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              backgroundColor: isCompleted
                ? theme.colors.success.light
                : isInProgress
                  ? theme.colors.primary.light
                  : theme.colors.background.secondary,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Icon
              name={getDocumentIcon(doc.type)}
              size={24}
              color={isCompleted ? theme.colors.success.DEFAULT : theme.colors.text.primary}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: theme.colors.text.primary,
                marginBottom: 4,
              }}
              numberOfLines={1}
            >
              {doc.name}
            </Text>

            <Text
              style={{
                fontSize: 12,
                color: theme.colors.text.secondary,
                marginBottom: 8,
              }}
            >
              {doc.type} • {doc.totalPages || '?'} pages • Last read{' '}
              {doc.lastAccessedAt
                ? new Date(doc.lastAccessedAt).toLocaleDateString()
                : 'Never'}
            </Text>

            <ProgressBar
              progress={doc.progressPercent / 100}
              height={4}
              backgroundColor={theme.colors.background.secondary}
              fillColor={isCompleted ? theme.colors.success.DEFAULT : theme.colors.primary.DEFAULT}
            />

            <Text
              style={{
                fontSize: 12,
                color: theme.colors.text.secondary,
                marginTop: 4,
              }}
            >
              {doc.progressPercent}% complete
              {isInProgress && doc.currentPage && ` (Page ${doc.currentPage})`}
            </Text>
          </View>

          {/* Action button */}
          {isInProgress && (
            <TouchableOpacity
              onPress={() => onContinueReading(doc.id)}
              style={{
                backgroundColor: theme.colors.primary.DEFAULT,
                borderRadius: 8,
                paddingVertical: 8,
                paddingHorizontal: 12,
                marginLeft: 8,
              }}
            >
              <Text style={{ color: theme.colors.text.inverse, fontSize: 12, fontWeight: '600' }}>
                Continue
              </Text>
            </TouchableOpacity>
          )}

          {!isInProgress && !isCompleted && (
            <TouchableOpacity
              onPress={() => onStartStudySession(doc.id)}
              style={{
                backgroundColor: theme.colors.primary.DEFAULT,
                borderRadius: 8,
                paddingVertical: 8,
                paddingHorizontal: 12,
                marginLeft: 8,
              }}
            >
              <Text style={{ color: theme.colors.text.inverse, fontSize: 12, fontWeight: '600' }}>
                Study
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <Text style={{ color: theme.colors.text.secondary }}>Loading documents...</Text>
      </View>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <View
        style={{
          padding: 40,
          alignItems: 'center',
          backgroundColor: theme.colors.background.card,
          borderRadius: 12,
          margin: 16,
        }}
      >
        <Icon name="file-plus" size={48} color={theme.colors.text.secondary} />
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.text.primary,
            marginTop: 16,
            marginBottom: 8,
          }}
        >
          No documents yet
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: theme.colors.text.secondary,
            textAlign: 'center',
          }}
        >
          Upload PDFs, documents, or add web links to start studying with AI assistance.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      {/* In Progress Section */}
      {categorized.inProgress.length > 0 && (
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: theme.colors.text.primary,
              marginBottom: 12,
            }}
          >
            Continue Reading ({categorized.inProgress.length})
          </Text>
          {categorized.inProgress.map(renderDocumentCard)}
        </View>
      )}

      {/* Not Started Section */}
      {categorized.notStarted.length > 0 && (
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: theme.colors.text.primary,
              marginBottom: 12,
            }}
          >
            Ready to Start ({categorized.notStarted.length})
          </Text>
          {categorized.notStarted.map(renderDocumentCard)}
        </View>
      )}

      {/* Completed Section */}
      {categorized.completed.length > 0 && (
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: theme.colors.text.secondary,
              marginBottom: 12,
            }}
          >
            Completed ({categorized.completed.length})
          </Text>
          {categorized.completed.map(renderDocumentCard)}
        </View>
      )}

      {/* Stats Summary */}
      <View
        style={{
          backgroundColor: theme.colors.background.card,
          borderRadius: 12,
          padding: 16,
          marginTop: 8,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.text.primary,
            marginBottom: 12,
          }}
        >
          Your Study Stats
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: '700', color: theme.colors.primary.DEFAULT }}>
              {categorized.completed.length}
            </Text>
            <Text style={{ fontSize: 12, color: theme.colors.text.secondary }}>Completed</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: '700', color: theme.colors.primary.DEFAULT }}>
              {categorized.inProgress.length}
            </Text>
            <Text style={{ fontSize: 12, color: theme.colors.text.secondary }}>In Progress</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: '700', color: theme.colors.primary.DEFAULT }}>
              {documents.reduce((sum, d) => sum + (d.highlights?.length || 0), 0)}
            </Text>
            <Text style={{ fontSize: 12, color: theme.colors.text.secondary }}>Highlights</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};
