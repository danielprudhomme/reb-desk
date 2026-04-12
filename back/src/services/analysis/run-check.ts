import { BACKTEST_THRESHOLD_COMPUTE } from '@sec/constants/backtest-threshold.constants.ts';
import { RebReport } from '@sec/db/models/reb-report.ts';
import { BacktestPassAnalysis } from '@shared/models/backtest-pass-analysis.ts';
import { BacktestPass } from '@shared/models/backtest-pass.ts';
import { BacktestThresholdCheck } from '@shared/models/backtest-threshold-check.ts';
import { BacktestThresholdType } from '@shared/models/backtest-threshold-type.ts';
import { BacktestThreshold } from '@shared/models/backtest-threshold.ts';

export function runChecks(
  report: RebReport,
  passes: BacktestPass[],
  thresholds: BacktestThreshold[],
  valuesByType: Record<BacktestThresholdType, { worstValues: number[]; min: number; max: number }>,
): BacktestPassAnalysis[] {
  return passes.map((pass) => {
    const checks: BacktestThresholdCheck[] = thresholds.map((threshold) => {
      const compute = BACKTEST_THRESHOLD_COMPUTE[threshold.type];
      const passValues = compute(pass, report.capital);

      const validCount = passValues.filter((value) =>
        threshold.operator === '>' ? value > threshold.value : value < threshold.value,
      ).length;
      const rate = (validCount / passValues.length) * 100;
      const ok = rate >= threshold.passRate;

      const worstValue =
        threshold.operator === '>' ? Math.min(...passValues) : Math.max(...passValues);
      const averageValue = passValues.reduce((acc, v) => acc + v, 0) / passValues.length;
      const bestValue =
        threshold.operator === '>' ? Math.max(...passValues) : Math.min(...passValues);

      if (ok) {
        const values = valuesByType[threshold.type];
        if (values) {
          values.worstValues.push(worstValue);
          values.min = Math.min(values.min, worstValue);
          values.max = Math.max(values.max, worstValue);
        } else {
          valuesByType[threshold.type] = {
            worstValues: [worstValue],
            min: worstValue,
            max: worstValue,
          };
        }
      }

      return {
        type: threshold.type,
        ok,
        worstValue,
        averageValue,
        bestValue,
        rate,
        requiredRate: threshold.passRate,
        score: 0,
      };
    });

    return {
      ok: false,
      checks,
      score: 0,
      reportId: report.id,
      passIds: [pass.id],
      // parameters: pass.parameters,
      longTermResults: pass.longTermResults,
      expert: report.expert,
      symbol: report.symbol,
      timeframe: report.timeframe,
      capital: report.capital,
      shortTermCount: report.shortTermCount,
      shortTermDuration: report.shortTermDuration,
      shortTermUnit: report.shortTermUnit,
      longTermDuration: report.longTermDuration,
      longTermUnit: report.longTermUnit,
    };
  });
}
