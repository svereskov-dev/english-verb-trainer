import type { SessionConfig } from "./exercises";
import type { ProgressRecord } from "./srs";

/** A mistake is active until a Review Mistakes answer explicitly clears it. */
export function getActiveMistakeRecords(records: ProgressRecord[]): ProgressRecord[] {
  return records.filter(record => record.lastFailureDate > 0);
}

/** Keep the caller's priority order while ensuring an exercise is reviewed once. */
export function createReviewQueue(mistakeIds: string[]): string[] {
  return [...new Set(mistakeIds)];
}

/** Both Review Mistakes entry points use this exact-ID session shape. */
export function createExactReviewConfig(
  mistakeIds: string[],
  letterBuilderEnabled: boolean,
): SessionConfig {
  return {
    id: "mistake-review",
    label: "Review Mistakes",
    groupLabel: "Mistakes",
    selectedIds: ["mistakes"],
    exerciseTypes: ["verbform", "irregular"],
    verbPool: "all",
    reviewMistakeIds: createReviewQueue(mistakeIds),
    contextEnabled: false,
    letterBuilderEnabled,
    userCustomized: true,
  };
}

/** A saved queue can restore only when every unfinished item is still active. */
export function canRestorePendingReviewQueue(
  pendingMistakeIds: string[] | undefined,
  activeMistakeIds: string[],
): boolean {
  if (!pendingMistakeIds?.length) return false;
  const active = new Set(activeMistakeIds);
  return pendingMistakeIds.every(id => active.has(id));
}

/** A correct answer or Skip consumes the current item for this one-pass session. */
export function removeCurrentReviewItem(queue: string[]): string[] {
  return queue.slice(1);
}

/** Incorrect answers remain unresolved and return after the other queued items. */
export function rotateCurrentReviewItem(queue: string[]): string[] {
  if (queue.length < 2) return queue;
  return [...queue.slice(1), queue[0]];
}