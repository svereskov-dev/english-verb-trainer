import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { ProgressRecord } from '../engine/srs';

interface VerbTrainerDB extends DBSchema {
  progress: {
    key: string;
    value: ProgressRecord;
    indexes: {
      'by-due-date': number;
      'by-type': string;
    };
  };
  settings: {
    key: string;
    value: any;
  };
  stats: {
    key: string;
    value: any;
  };
}

let dbPromise: Promise<IDBPDatabase<VerbTrainerDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<VerbTrainerDB>('verb-trainer-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('progress')) {
          const progressStore = db.createObjectStore('progress', { keyPath: 'id' });
          progressStore.createIndex('by-due-date', 'dueDate');
          progressStore.createIndex('by-type', 'type');
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
        if (!db.objectStoreNames.contains('stats')) {
          db.createObjectStore('stats');
        }
      },
    });
  }
  return dbPromise;
}
