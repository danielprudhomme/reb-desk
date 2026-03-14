import Loki from 'lokijs';
import type { RebReport } from '@shared/models/reb-report.ts';

export const db = new Loki('reb-desk.db', {
  autoload: false, // we control loading manually
  autosave: true,
  autosaveInterval: 5000,
});

let rebReports: Collection<RebReport>;

export async function initDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.loadDatabase({}, (err) => {
      if (err) {
        reject(err);
        return;
      }

      rebReports = db.getCollection<RebReport>('rebReports');

      if (!rebReports) {
        rebReports = db.addCollection<RebReport>('rebReports', {
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

export function getRebReports() {
  return rebReports;
}
