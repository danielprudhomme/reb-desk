import { BacktestPassAnalysis } from '@shared/models/backtest-pass-analysis.ts';
import { BacktestThresholdCheck } from '@shared/models/backtest-threshold-check.ts';

export function groupPasses(
  analyzedPasses: BacktestPassAnalysis[],
  margin: number = 0.1, // default 10%
): BacktestPassAnalysis[] {
  const groups: BacktestPassAnalysis[] = [];

  for (const pass of analyzedPasses) {
    let foundGroup = false;

    for (const group of groups) {
      if (arePassesClose(pass, group, margin)) {
        group.passIds.push(...pass.passIds);
        foundGroup = true;
        break;
      }
    }

    if (!foundGroup) {
      groups.push({
        ...pass,
        passIds: [...pass.passIds],
      });
    }
  }

  return groups;
}

function isClose(a: number, b: number, margin: number): boolean {
  if (a === b) return true;

  const diff = Math.abs(a - b);
  const max = Math.max(Math.abs(a), Math.abs(b));

  return diff <= max * margin;
}

function areChecksClose(
  a: BacktestThresholdCheck,
  b: BacktestThresholdCheck,
  margin: number,
): boolean {
  return (
    a.type === b.type &&
    a.ok === b.ok &&
    isClose(a.worstValue, b.worstValue, margin) &&
    isClose(a.averageValue, b.averageValue, margin) &&
    isClose(a.bestValue, b.bestValue, margin) &&
    isClose(a.rate, b.rate, margin) &&
    isClose(a.requiredRate, b.requiredRate, margin) &&
    isClose(a.score, b.score, margin)
  );
}

function arePassesClose(a: BacktestPassAnalysis, b: BacktestPassAnalysis, margin: number): boolean {
  if (a.checks.length !== b.checks.length) return false;

  const mapB = new Map(b.checks.map((c) => [c.type, c]));

  for (const checkA of a.checks) {
    const checkB = mapB.get(checkA.type);
    if (!checkB) return false;

    if (!areChecksClose(checkA, checkB, margin)) {
      return false;
    }
  }

  return true;
}
