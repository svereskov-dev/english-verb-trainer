import { getDB } from './index';

export interface Stats {
  sessionAnswers: number;
  totalAnswers: number;
  totalCorrect: number;
  currentStreak: number;
  bestStreak: number;
  totalStudySeconds: number;
  lastStudyDate: number;
}

const defaultStats: Stats = {
  sessionAnswers: 0,
  totalAnswers: 0,
  totalCorrect: 0,
  currentStreak: 0,
  bestStreak: 0,
  totalStudySeconds: 0,
  lastStudyDate: 0
};

export async function getStats(): Promise<Stats> {
  const db = await getDB();
  const keys = ['sessionAnswers', 'totalAnswers', 'totalCorrect', 'currentStreak', 'bestStreak', 'totalStudySeconds', 'lastStudyDate'];
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
