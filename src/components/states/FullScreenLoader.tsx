/**
 * Full Screen Loader
 *
 * Full-screen loading overlay preset.
 */
import React from 'react';
import { LoadingState } from './LoadingState';

/** Full screen loading overlay */
export const FullScreenLoader: React.FC<{ message?: string }> = ({
  message,
}) => <LoadingState fullScreen message={message} />;
