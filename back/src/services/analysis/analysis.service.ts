import { AnalysisRequest } from '@shared/models/analysis-request.ts';
import { db } from '@src/db/database.ts';
import { backtestsTable, rebReportsTable } from '@src/db/schema/index.ts';
import { eq } from 'drizzle-orm';

export async function runAnalysis(request: AnalysisRequest): Promise<void> {
  if (!request.reportId && !request.strategyContextId) {
    throw new Error('reportId or strategyContextId must be provided');
  }

  const condition = request.reportId
    ? eq(backtestsTable.reportId, request.reportId)
    : eq(rebReportsTable.strategyContextId, request.strategyContextId!);

  const ids = (
    await db
      .select({ id: backtestsTable.id })
      .from(backtestsTable)
      .innerJoin(rebReportsTable, eq(backtestsTable.reportId, rebReportsTable.id))
      .where(condition)
  ).map((x) => x.id);

  const backtestList = await db.query.backtestsTable.findMany({
    where: (backtestsTable, { inArray }) => inArray(backtestsTable.id, ids),
    with: {
      parameterSet: true,
      results: true,
    },
  });

  console.log('Analysis result:', backtestList.length, backtestList[0]);
}

// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// interface GroupedReport {
//   context: {
//     expert: ExpertAdvisor;
//     symbol: Symbol;
//     timeframe: Timeframe;
//     capital: Capital;
//     startDate: string;
//     shortTermCount: number;
//     shortTermDuration: number;
//     shortTermUnit: TimeUnit;
//     longTermDuration: number;
//     longTermUnit: TimeUnit;
//   };
//   reports: RebReport[];
//   passes: BacktestPass[];
//   groupedPasses: GroupedBacktestPassAnalysis[];
// }

// async function analyzeReports(
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   query: any,
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   thresholds: BacktestThreshold[],
// ): Promise<GroupedReportAnalysis[]> {
//   const reports = collections.RebReport().find(query);

//   if (!reports.length) {
//     return [];
//   }

//   // const valuesByType: ValuesByThresholdType = {} as ValuesByThresholdType;
//   // const grouped = new Map<string, GroupedReport>();

//   for (const report of reports) {
//     const backtests = collections.Backtest().find({ reportId: report.id });
//     const parsedRebReport = await parseRebReport(report.path);

//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     const backtestsWithResults: BacktestWithResults[] = backtests.map((backtest) => {
//       const passData = parsedRebReport.parsedPasses.find(
//         (pass) => pass.passNumber === backtest.passNumber,
//       );
//       return {
//         ...backtest,
//         shortTermResults: passData?.shortTermResults || [],
//         longTermResults: passData?.longTermResults || [],
//       };
//     });
//   }
//   //   const passes: BacktestPass[] = (await parseRebPass(report.path)).map((pass) => ({
//   //     ...pass,
//   //     reportId: report.id,
//   //   }));

//   //   const key = buildContextKey(report);
//   //   if (!grouped.has(key)) {
//   //     grouped.set(key, {
//   //       context: report,
//   //       reports: [],
//   //       passes: [],
//   //       groupedPasses: [],
//   //     });
//   //   }

//   //   const group = grouped.get(key)!;

//   //   group.reports.push(report);
//   //   group.passes.push(...passes);
//   // }

//   // for (const group of grouped.values()) {
//   //   const groupedPasses = groupPasses(group.passes, 0.1);
//   //   const analyzedGroupedPasses = runChecks(
//   //     groupedPasses,
//   //     group.context.capital,
//   //     thresholds,
//   //     valuesByType,
//   //   );
//   //   computeScore(analyzedGroupedPasses, thresholds, valuesByType);
//   //   group.groupedPasses = analyzedGroupedPasses;
//   // }

//   // return Array.from(grouped.values()).map((group) => ({
//   //   expert: group.context.expert,
//   //   symbol: group.context.symbol,
//   //   timeframe: group.context.timeframe,
//   //   capital: group.context.capital,
//   //   startDate: group.context.startDate,
//   //   shortTermCount: group.context.shortTermCount,
//   //   shortTermDuration: group.context.shortTermDuration,
//   //   shortTermUnit: group.context.shortTermUnit,
//   //   longTermDuration: group.context.longTermDuration,
//   //   longTermUnit: group.context.longTermUnit,
//   //   passes: group.groupedPasses,
//   // }));

//   return [];
// }

// // function buildContextKey(report: RebReport): string {
// //   return [
// //     report.expert,
// //     report.symbol,
// //     report.timeframe,
// //     report.capital,
// //     report.startDate,
// //     report.shortTermCount,
// //     report.shortTermDuration,
// //     report.shortTermUnit,
// //     report.longTermDuration,
// //     report.longTermUnit,
// //   ].join('|');
// // }
