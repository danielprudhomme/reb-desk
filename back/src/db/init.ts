import { collections } from './collections.ts';
import { db } from './database.ts';

export async function initDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.loadDatabase({}, (err) => {
      if (err) {
        reject(err);
        return;
      }

      collections.CreateAll();

      db.saveDatabase((err) => {
        if (err) console.error('Initial save failed:', err);
        resolve();
      });
    });
  });
}
