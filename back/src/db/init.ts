import { RebReport } from '@shared/models/reb-report.ts';
import { db } from './database.ts';

export async function initDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.loadDatabase({}, (err) => {
      if (err) {
        reject(err);
        return;
      }

      const rebReports = db.getCollection<RebReport>('rebReports');

      if (!rebReports) {
        db.addCollection<RebReport>('rebReports', {
          indices: ['id', 'symbol', 'expert'],
        });
      }

      db.saveDatabase((err) => {
        if (err) console.error('Initial save failed:', err);
        else console.log('DB ready, file created at reb-desk.db');
        resolve();
      });
    });
  });
}
