import Loki from 'lokijs';
import type { OptimizationReport } from '@shared/models/optimization-report.ts';

export const db = new Loki('reb-desk.db', {
  autoload: false, // we control loading manually
  autosave: true,
  autosaveInterval: 5000,
});

let optimizationReports: Collection<OptimizationReport>;

export async function initDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.loadDatabase({}, (err) => {
      if (err) {
        reject(err);
        return;
      }

      optimizationReports = db.getCollection<OptimizationReport>('optimizationReports');

      if (!optimizationReports) {
        optimizationReports = db.addCollection<OptimizationReport>('optimizationReports', {
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

export function getOptimizationReports() {
  return optimizationReports;
}
