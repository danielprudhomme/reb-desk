import {
  BacktestPassAnalysis,
  GroupedBacktestPassAnalysis,
} from '@shared/models/backtest-pass-analysis.ts';
import {
  BacktestPassParameter,
  GroupedBacktestPassParameter,
} from '@shared/models/backtest-pass-parameter.ts';
import { BacktestThresholdCheck } from '@shared/models/backtest-threshold-check.ts';

export function groupPasses(
  analyzedPasses: BacktestPassAnalysis[],
  margin: number,
): GroupedBacktestPassAnalysis[] {
  const groups: GroupedBacktestPassAnalysis[] = [];

  for (const pass of analyzedPasses) {
    let foundGroup = false;

    for (const group of groups) {
      if (!areBaseFieldsEqual(pass, group)) continue;

      if (arePassesClose(pass, group, margin)) {
        // TODO : merge other properties
        mergeParameters(pass.parameters, group.parameters);
        group.passes.push({ reportId: pass.reportId, passId: pass.passId });
        foundGroup = true;
        break;
      }
    }

    if (!foundGroup) {
      groups.push({
        ...pass,
        score: 0,
        passes: [{ reportId: pass.reportId, passId: pass.passId }],
        parameters: pass.parameters.map((x) => ({ name: x.name, values: [x.value] })),
      });
    }
  }

  return groups;
}

function areBaseFieldsEqual(
  pass: BacktestPassAnalysis,
  group: GroupedBacktestPassAnalysis,
): boolean {
  return (
    pass.expert === group.expert &&
    pass.symbol === group.symbol &&
    pass.timeframe === group.timeframe &&
    pass.capital === group.capital &&
    pass.shortTermCount === group.shortTermCount &&
    pass.shortTermDuration === group.shortTermDuration &&
    pass.shortTermUnit === group.shortTermUnit &&
    pass.longTermDuration === group.longTermDuration &&
    pass.longTermUnit === group.longTermUnit
  );
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

function arePassesClose(
  pass: BacktestPassAnalysis,
  group: GroupedBacktestPassAnalysis,
  margin: number,
): boolean {
  const mapGroup = new Map(group.checks.map((c) => [c.type, c]));

  for (const checkPass of pass.checks) {
    const checkGroup = mapGroup.get(checkPass.type);

    if (!checkGroup || !areChecksClose(checkPass, checkGroup, margin)) {
      return false;
    }
  }

  return true;
}

function mergeParameters(
  source: BacktestPassParameter[],
  target: GroupedBacktestPassParameter[],
): void {
  for (let i = 0; i < source.length; i++) {
    const value = source[i].value;
    const values = target[i].values;

    if (!values.includes(value)) {
      values.push(value);
    }
  }
}
