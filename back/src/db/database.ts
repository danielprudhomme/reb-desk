import Loki from 'lokijs';
import type { OptimizationReport } from '@shared/models/optimization-report.ts';

export const db = new Loki("reb-desk.db", {
  autoload: true,
  autosave: true,
  autosaveInterval: 5000
})

let optimizationReports: Collection<OptimizationReport>

export async function initDB(): Promise<void> {
  return new Promise((resolve) => {
    db.loadDatabase({}, () => {

      optimizationReports = db.getCollection<OptimizationReport>("optimizationReports")

      if (!optimizationReports) {
        optimizationReports = db.addCollection<OptimizationReport>(
          "optimizationReports",
          {
            indices: ["id", "symbol", "expert"]
          }
        )
      }

      console.log("DB ready")
      resolve()
    })
  })
}

export function getOptimizationReports() {
  return optimizationReports
}