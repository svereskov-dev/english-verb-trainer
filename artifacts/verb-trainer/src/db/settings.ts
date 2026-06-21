import { getDB } from './index';

export type Difficulty = "beginner" | "intermediate" | "advanced";
export type Theme = "dark" | "light" | "system";

export interface Settings {
  difficulty: Difficulty;
  dailyGoal: number;
  includeSubject: boolean;
  theme: Theme;
}

const defaultSettings: Settings = {
  difficulty: "beginner",
  dailyGoal: 25,
  includeSubject: false,
  theme: "dark"
};

export async function getSettings(): Promise<Settings> {
  const db = await getDB();
  const diff = await db.get('settings', 'difficulty');
  if (!diff) {
    await saveSettings(defaultSettings);
    return defaultSettings;
  }
  return {
    difficulty: (await db.get('settings', 'difficulty')) || defaultSettings.difficulty,
    dailyGoal: (await db.get('settings', 'dailyGoal')) || defaultSettings.dailyGoal,
    includeSubject: (await db.get('settings', 'includeSubject')) || defaultSettings.includeSubject,
    theme: (await db.get('settings', 'theme')) || defaultSettings.theme,
  };
}

export async function saveSettings(settings: Settings): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('settings', 'readwrite');
  await tx.objectStore('settings').put(settings.difficulty, 'difficulty');
  await tx.objectStore('settings').put(settings.dailyGoal, 'dailyGoal');
  await tx.objectStore('settings').put(settings.includeSubject, 'includeSubject');
  await tx.objectStore('settings').put(settings.theme, 'theme');
  await tx.done;
}
