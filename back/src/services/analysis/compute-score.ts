import { BacktestThresholdType } from '@shared/models/backtest-threshold-type.ts';
import { BacktestThreshold } from '@shared/models/backtest-threshold.ts';
import valueTypeConst from '@shared/constants/backtest-threshold-value-type.ts';
import { BacktestThresholdCheck } from '@shared/models/backtest-threshold-check.ts';
import { ValuesByThresholdType } from './models/values-by-thresold-type.ts';
import { AnalyzedGroupedBacktest } from '@shared/models/backtest.ts';

export function computeScore(
  groupedBacktests: AnalyzedGroupedBacktest[],
  thresholds: BacktestThreshold[],
  valuesByType: ValuesByThresholdType,
) {
  const thresholdsMap: Record<BacktestThresholdType, BacktestThreshold> = Object.fromEntries(
    thresholds.map((t) => [t.type, t]),
  ) as Record<BacktestThresholdType, BacktestThreshold>;

  groupedBacktests.forEach((backtest) => {
    backtest.checks.forEach((check) => {
      const { min, max } = valuesByType[check.type] ?? {};

      if (!min || min === max) {
        check.score = check.ok ? 0.5 : 0;
        return;
      }

      const threshold = thresholdsMap[check.type];

      // ===== CAS 1 : OK =====
      if (check.ok) {
        computeScoreWhenCheckOk(check, threshold, min, max);
      }
      // ===== CAS 2 : MARGE (uniquement pour rate) =====
      else if (valueTypeConst.BACKTEST_THRESHOLD_VALUE_TYPE[threshold.type] === 'rate') {
        computeScoreNotOkForRate(check, threshold);
      }
      // ===== CAS 2 BIS : MARGE pour VALUE =====
      else {
        computeScoreNotOkForValue(check, threshold);
      }
    });

    const ok = backtest.checks.every((c) => c.score > 0);

    const totalWeight = backtest.checks.reduce(
      (acc, c) => acc + (thresholdsMap[c.type].weight ?? 1),
      0,
    );
    const score =
      backtest.checks.reduce((acc, c) => acc + c.score * (thresholdsMap[c.type].weight ?? 1), 0) /
      totalWeight;

    const hasCriticalFail = backtest.checks.some(
      (c) => !c.ok && (thresholds.find((t) => t.type === c.type)?.weight ?? 1) >= 3,
    );
    const finalScore = !ok ? (hasCriticalFail ? score * 0.5 : score * 0.75) : score;

    backtest.ok = ok;
    backtest.score = finalScore;
  });
}

function computeScoreWhenCheckOk(
  check: BacktestThresholdCheck,
  threshold: BacktestThreshold,
  min: number,
  max: number,
) {
  let normalized =
    threshold.operator === '>'
      ? (check.worstValue - min) / (max - min)
      : (max - check.worstValue) / (max - min);

  normalized = Math.max(0, Math.min(1, normalized));

  check.score = 0.5 + 0.5 * Math.pow(normalized, 2);
}

function computeScoreNotOkForRate(check: BacktestThresholdCheck, threshold: BacktestThreshold) {
  const margin = threshold.passRate * 0.1;
  const minAcceptableRate = threshold.passRate - margin;

  if (check.rate >= minAcceptableRate) {
    const normalized = (check.rate - minAcceptableRate) / (threshold.passRate - minAcceptableRate);

    // score entre 0 → 0.5
    check.score = 0.5 * Math.pow(normalized, 2);
  }
}

export function computeScoreNotOkForValue(
  check: BacktestThresholdCheck,
  threshold: BacktestThreshold,
) {
  if (check.rate < threshold.passRate * 0.5) return;

  const margin = threshold.value * 0.1; // 10%

  if (threshold.operator === '<') {
    const maxAcceptable = threshold.value + margin;

    if (check.worstValue <= maxAcceptable) {
      const normalized = (maxAcceptable - check.worstValue) / (maxAcceptable - threshold.value);

      check.score = 0.5 * Math.pow(Math.max(0, Math.min(1, normalized)), 2);
    }
  } else {
    const minAcceptable = threshold.value - margin;

    if (check.worstValue >= minAcceptable) {
      const normalized = (check.worstValue - minAcceptable) / (threshold.value - minAcceptable);

      check.score = 0.5 * Math.pow(Math.max(0, Math.min(1, normalized)), 2);
    }
  }
}
