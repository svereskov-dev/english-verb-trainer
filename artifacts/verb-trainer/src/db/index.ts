import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { ProgressRecord } from '../engine/srs';

interface VerbTrainerDB extends DBSchema {
  progress: {
    key: string;
    value: ProgressRecord;
    indexes: {
      'by-due-date': number;
      'by-type': string;
      'by-failure-date': number;
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
    dbPromise = openDB<VerbTrainerDB>('verb-trainer-db', 2, {
      upgrade(db, oldVersion, newVersion, transaction) {
        if (!db.objectStoreNames.contains('progress')) {
          const store = db.createObjectStore('progress', { keyPath: 'id' });
          store.createIndex('by-due-date', 'dueDate');
          store.createIndex('by-type', 'type');
          store.createIndex('by-failure-date', 'lastFailureDate');
        } else if (oldVersion < 2) {
          const store = transaction.objectStore('progress');
          if (!store.indexNames.contains('by-failure-date')) {
            store.createIndex('by-failure-date', 'lastFailureDate');
          }
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
