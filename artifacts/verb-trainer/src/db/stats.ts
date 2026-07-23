import { getDB } from './index';

export interface Stats {
  sessionAnswers: number;
  totalAnswers: number;
  totalCorrect: number;
  totalIncorrect: number;
  dailyCorrect: number;
  dailyIncorrect: number;
  currentStreak: number;
  bestStreak: number;
  totalStudySeconds: number;
  lastStudyDate: number;
}

const defaultStats: Stats = {
  sessionAnswers: 0,
  totalAnswers: 0,
  totalCorrect: 0,
  totalIncorrect: 0,
  dailyCorrect: 0,
  dailyIncorrect: 0,
  currentStreak: 0,
  bestStreak: 0,
  totalStudySeconds: 0,
  lastStudyDate: 0
};

export async function getStats(): Promise<Stats> {
  const db = await getDB();
  const keys = ['sessionAnswers', 'totalAnswers', 'totalCorrect', 'totalIncorrect', 'dailyCorrect', 'dailyIncorrect', 'currentStreak', 'bestStreak', 'totalStudySeconds', 'lastStudyDate'];
  const stats: any = {};
  let empty = true;
  for (const key of keys) {
    const val = await db.get('stats', key);
    if (val !== undefined) {
      empty = false;
      stats[key] = val;
    }
  }
  if (empty) {
    await saveStats(defaultStats);
    return defaultStats;
  }

  // Backward compat
  if (stats.totalIncorrect === undefined) stats.totalIncorrect = 0;
  if (stats.dailyCorrect === undefined) stats.dailyCorrect = 0;
  if (stats.dailyIncorrect === undefined) stats.dailyIncorrect = 0;

  // Daily reset: if lastStudyDate is from a previous day, reset daily counters.
  // Note: sessionAnswers is intentionally left as-is. It represents today's
  // completed exercise count for the daily goal progress bar, so it should be
  // reset exactly when the daily goal itself resets. We therefore reset it
  // here as well so it stays in sync with dailyCorrect/dailyIncorrect.
  const lastDate = stats.lastStudyDate ?? 0;
  const today = new Date().setHours(0, 0, 0, 0);
  if (lastDate > 0 && lastDate < today) {
    stats.dailyCorrect = 0;
    stats.dailyIncorrect = 0;
    stats.sessionAnswers = 0;
    stats.currentStreak = 0;
    await saveStats(stats as Stats);
  }

  return stats as Stats;
}

export async function saveStats(stats: Stats): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('stats', 'readwrite');
  for (const [k, v] of Object.entries(stats)) {
    await tx.objectStore('stats').put(v, k);
  }
  await tx.done;
}
