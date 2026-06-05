import { BACKTEST_THRESHOLD_COMPUTE } from '@src/constants/backtest-threshold.constants.ts';
import { BacktestThresholdCheck } from '@shared/models/backtest-threshold-check.ts';
import { BacktestThreshold } from '@shared/models/backtest-threshold.ts';
import { ValuesByThresholdType } from './models/values-by-thresold-type.ts';
import { AnalyzedGroupedBacktest, GroupedBacktest } from '@shared/models/backtest.ts';

export function runChecks(
  groupedBacktests: GroupedBacktest[],
  capital: number,
  thresholds: BacktestThreshold[],
  valuesByType: ValuesByThresholdType,
): AnalyzedGroupedBacktest[] {
  return groupedBacktests.map((backtest) => {
    const checks: BacktestThresholdCheck[] = thresholds.map((threshold) => {
      const passValues = BACKTEST_THRESHOLD_COMPUTE[threshold.type]({ ...backtest, capital });

      const validCount = passValues.filter((value) =>
        threshold.operator === '>' ? value > threshold.value : value < threshold.value,
      ).length;
      const rate = (validCount / passValues.length) * 100;
      const ok = rate >= threshold.passRate;

      const { min, max, average: averageValue } = getMinMaxAverage(passValues);
      const worstValue = threshold.operator === '>' ? min : max;
      const bestValue = threshold.operator === '>' ? max : min;

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

    return { ...backtest, ok: false, checks, score: 0 };
  });
}

// Better for performance than Math.min(...values), etc
function getMinMaxAverage(values: number[]): { min: number; max: number; average: number } {
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;

  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v;
    sum += v;
  }
  return { min, max, average: sum / values.length };
}
