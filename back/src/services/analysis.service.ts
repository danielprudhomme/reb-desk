// import definitions from '@shared/constants/backtest-threshold-definitions.ts';
// import { BacktestThresholdType } from '@shared/models/backtest-threshold-type.ts';
// import { BacktestThreshold } from '@shared/models/backtest-threshold.js';

import { collections } from 'src/db/collections.ts';
import { parseRebFile } from './reb-parser.service.ts';

export async function runAnalysis(reportId: string) {
  const report = collections.RebReport().findOne({ id: reportId });

  if (!report) {
    throw new Error(`Report not found for id ${reportId}`);
  }

  const pp = await parseRebFile(report.path);

  console.log('report', pp);

  // // A définir - pas hardcodé
  // const thresholds: BacktestThreshold[] = [
  //   {
  //     type: 'longTermResultPercent',
  //     operator: '>',
  //     value: 0,
  //     passRate: 100, // toujours 100% pour LT
  //   },
  //   {
  //     type: 'shortTermPassResultPercent',
  //     operator: '>',
  //     value: 0,
  //     passRate: 80, // ex. passage validé si ≥ 80% des passages CT respectent ce seuil
  //   },
  //   {
  //     type: 'longTermGainLossRatio',
  //     operator: '>',
  //     value: 1,
  //     passRate: 100, // LT
  //   },
  //   {
  //     type: 'shortTermTrades',
  //     operator: '>',
  //     value: 1,
  //     passRate: 100, // peut être 100% ou moins selon ta logique
  //   },
  //   {
  //     type: 'shortTermDrawdownPercent',
  //     operator: '<',
  //     value: 15,
  //     passRate: 80, // validé si 80% des passages CT respectent le seuil
  //   },
  //   {
  //     type: 'longTermDrawdownAmount',
  //     operator: '<',
  //     value: 550,
  //     passRate: 100, // LT
  //   },
  // ];
  // console.log('thresholds', thresholds);
}
