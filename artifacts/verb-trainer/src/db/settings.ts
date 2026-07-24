import { getDB } from './index';

export type Difficulty = "beginner" | "intermediate" | "advanced";
export type Theme = "dark" | "light";

export interface Settings {
  difficulty: Difficulty;
  dailyGoal: number;
  includeSubject: boolean;
  theme: Theme;
  hasCompletedOnboarding: boolean;
}

const defaultSettings: Settings = {
  difficulty: "beginner",
  dailyGoal: 20,
  includeSubject: false,
  theme: "dark",
  hasCompletedOnboarding: false,
};

// Unified daily goal options across onboarding and Settings.
const allowedDailyGoals = [10, 20, 35, 50];

function normalizeDailyGoal(value: number): number {
  return allowedDailyGoals.includes(value) ? value : defaultSettings.dailyGoal;
}

export async function getSettings(): Promise<Settings> {
  const db = await getDB();
  const diff = await db.get('settings', 'difficulty');
  if (!diff) {
    await saveSettings(defaultSettings);
    return defaultSettings;
  }

  const rawTheme = await db.get('settings', 'theme');
  // Migrate legacy "system" and "light" themes to "dark" (the only supported theme)
  const theme = rawTheme === "system" || rawTheme === "light"
    ? "dark"
    : (rawTheme || defaultSettings.theme);

  return {
    difficulty: (await db.get('settings', 'difficulty')) || defaultSettings.difficulty,
    dailyGoal: normalizeDailyGoal((await db.get('settings', 'dailyGoal')) || defaultSettings.dailyGoal),
    includeSubject: (await db.get('settings', 'includeSubject')) || defaultSettings.includeSubject,
    theme,
    hasCompletedOnboarding: (await db.get('settings', 'hasCompletedOnboarding')) ?? false,
  };
}

export async function saveSettings(settings: Settings): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('settings', 'readwrite');
  await tx.objectStore('settings').put(settings.difficulty, 'difficulty');
  await tx.objectStore('settings').put(settings.dailyGoal, 'dailyGoal');
  await tx.objectStore('settings').put(settings.includeSubject, 'includeSubject');
  await tx.objectStore('settings').put(settings.theme, 'theme');
  await tx.objectStore('settings').put(settings.hasCompletedOnboarding, 'hasCompletedOnboarding');
  await tx.done;
}
