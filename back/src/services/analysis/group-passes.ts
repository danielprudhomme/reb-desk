import { BacktestPassResult } from '@shared/models/backtest-pass-result.ts';
import { BacktestPass, GroupedBacktestPass } from '@shared/models/backtest-pass.ts';

type InternalGroup = GroupedBacktestPass & {
  representative: BacktestPass;
};

export function groupPasses(passes: BacktestPass[], margin: number): GroupedBacktestPass[] {
  const groups: InternalGroup[] = [];

  for (const pass of passes) {
    let foundGroup: InternalGroup | undefined;

    for (const group of groups) {
      if (
        areResultsClose(pass.shortTermResults, group.shortTermResults, margin) &&
        areResultsClose(pass.longTermResults, group.longTermResults, margin)
      ) {
        foundGroup = group;
        break;
      }
    }

    if (!foundGroup) {
      groups.push({
        // BaseBacktestPass fields
        shortTermResults: pass.shortTermResults,
        longTermResults: pass.longTermResults,

        // Group-specific
        passes: [{ reportId: pass.reportId, passId: pass.passId }],
        parameters: pass.parameters.map((p) => ({
          name: p.name,
          values: [p.value],
        })),

        // internal
        representative: pass,
      });
    } else {
      foundGroup.passes.push({
        reportId: pass.reportId,
        passId: pass.passId,
      });

      for (const param of pass.parameters) {
        const existing = foundGroup.parameters.find((p) => p.name === param.name);

        if (!existing) {
          foundGroup.parameters.push({
            name: param.name,
            values: [param.value],
          });
        } else {
          existing.values.push(param.value);
        }
      }
    }
  }

  return groups;
}

function areResultsClose(a: BacktestPassResult[], b: BacktestPassResult[], margin: number) {
  if (a.length !== b.length) return false;
  const fields: (keyof BacktestPassResult)[] = [
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
