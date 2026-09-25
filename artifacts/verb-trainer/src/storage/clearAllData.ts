export interface RemovableStorage {
  removeItem(key: string): void;
}

/**
 * Persisted practice state is learning data. Settings, access state, and
 * promotional scheduling intentionally live outside this list.
 */
export const LEARNING_LOCAL_STORAGE_KEYS = [
  "practice_config",
  "practice_config_date",
  "practice_mistakes_review_active",
  "practice_mistakes_review_letter_builder",
] as const;

/**
 * These are transient exercise/navigation states, not user preferences.
 * dictionary_filter is intentionally preserved because it is a preference.
 */
export const LEARNING_SESSION_STORAGE_KEYS = [
  "exercise_session",
  "mistake_review_session",
  "mistakeReview",
  "progress-daily-total",
  "openTrainingMenu",
  "tensesContext",
] as const;

export function clearLearningBrowserStorage(
  localStorage: RemovableStorage,
  sessionStorage: RemovableStorage,
): void {
  for (const key of LEARNING_LOCAL_STORAGE_KEYS) {
    localStorage.removeItem(key);
  }
  for (const key of LEARNING_SESSION_STORAGE_KEYS) {
    sessionStorage.removeItem(key);
  }
}