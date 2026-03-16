import { createRebParameterCollection } from 'src/modules/reb-parameter/reb-parameter.collection.ts';
import { db } from './database.ts';
import { createRebReportCollection } from 'src/modules/reb-report/reb-report.collection.ts';

export async function initDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.loadDatabase({}, (err) => {
      if (err) {
        reject(err);
        return;
      }

      createRebReportCollection();
      createRebParameterCollection();

      db.saveDatabase((err) => {
        if (err) console.error('Initial save failed:', err);
        resolve();
      });
    });
  });
}
