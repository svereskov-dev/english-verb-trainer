import { getDB } from './index';
import { ProgressRecord } from '../engine/srs';

export async function getProgress(id: string): Promise<ProgressRecord | undefined> {
  const db = await getDB();
  return db.get('progress', id);
}

export async function saveProgress(record: ProgressRecord): Promise<void> {
  const db = await getDB();
  await db.put('progress', record);
}

export async function getAllProgress(): Promise<ProgressRecord[]> {
  const db = await getDB();
  return db.getAll('progress');
}

export async function getDueProgress(now: number): Promise<ProgressRecord[]> {
  const db = await getDB();
  const range = IDBKeyRange.upperBound(now);
  return db.getAllFromIndex('progress', 'by-due-date', range);
}
