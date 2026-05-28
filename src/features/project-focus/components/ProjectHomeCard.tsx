import React from "react";
import { type ProjectThread } from "../schemas";
import { Skeleton, EmptyState, ActiveCard } from "./ProjectHomeCardStates";

type Props = {
  isLoading: boolean;
  onPressResume: () => void;
  onPressCreate: () => void;
  thread: ProjectThread | null;
};

export function ProjectHomeCard({
  isLoading,
  onPressResume,
  onPressCreate,
  thread,
}: Props): React.ReactElement {
  if (isLoading) return <Skeleton />;
  if (!thread) return <EmptyState onPressCreate={onPressCreate} />;
  return <ActiveCard onPressResume={onPressResume} thread={thread} />;
}
