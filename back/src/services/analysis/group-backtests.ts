import { BacktestResult } from '@shared/models/backtest-result.ts';
import { Backtest, GroupedBacktest } from '@shared/models/backtest.ts';
import { GroupedParameterSet } from '@shared/models/parameter-set.ts';

export function groupBacktests(backtests: Backtest[], margin: number): GroupedBacktest[] {
  const groups: GroupedBacktest[] = [];

  for (const backtest of backtests) {
    let foundGroup: GroupedBacktest | undefined;

    for (const group of groups) {
      const shortMatch = areResultsClose(backtest.shortTermResults, group.shortTermResults, margin);

      const longMatch = areResultsClose(backtest.longTermResults, group.longTermResults, margin);

      if (shortMatch && longMatch) {
        foundGroup = group;
        break;
      }
    }

    // 🆕 CREATE GROUP
    if (!foundGroup) {
      const groupedParameterSet: GroupedParameterSet = {
        id: crypto.randomUUID(),
        parameters: backtest.parameterSet.parameters.map((p) => ({
          name: p.name,
          values: [p.value],
        })),
      };

      const newGroup: GroupedBacktest = {
        ...backtest,
        reportIds: [backtest.reportId],
        parameterSetIds: [backtest.parameterSetId],
        passNumbers: [backtest.passNumber],
        parameterSets: [backtest.parameterSet],
        groupedParameterSet,
      };

      groups.push(newGroup);
      continue;
    }

    // ➕ MERGE INTO GROUP
    foundGroup.reportIds.push(backtest.reportId);
    foundGroup.parameterSetIds.push(backtest.parameterSetId);
    foundGroup.passNumbers.push(backtest.passNumber);
    foundGroup.parameterSets.push(backtest.parameterSet);

    // merge grouped parameters
    for (const param of backtest.parameterSet.parameters) {
      const existing = foundGroup.groupedParameterSet.parameters.find((p) => p.name === param.name);

      if (!existing) {
        foundGroup.groupedParameterSet.parameters.push({
          name: param.name,
          values: [param.value],
        });
      } else {
        existing.values.push(param.value);
      }
    }
  }

  return groups;
}

function areResultsClose(a: BacktestResult[], b: BacktestResult[], margin: number) {
  if (a.length !== b.length) return false;
  const fields: (keyof BacktestResult)[] = [
    'result',
    'trades',
    'profitFactor',
    'resultPerTrade',
    'drawdownAmount',
    'drawdownPercent',
  ];

  return a.every((ra, i) => {
    const rb = b[i];
    return fields.every((field) => isClose(ra[field], rb[field], margin));
  });
}

function isClose(a: number, b: number, margin: number): boolean {
  if (a === 0 && b === 0) return true;
  if (a === 0 || b === 0) return Math.abs(a - b) <= margin;
  return Math.abs(a - b) / Math.max(Math.abs(a), Math.abs(b)) <= margin;
}
