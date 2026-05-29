import { collections } from '@src/db/collections.ts';
import { Backtest } from '@src/db/models/backtest.ts';

export const backtestResolvers = {
  Backtest: {
    parameterSet: (backtest: Backtest) =>
      !backtest.parameterSetId
        ? null
        : collections.ParameterSet().findOne({ id: backtest.parameterSetId }),
  },
};
