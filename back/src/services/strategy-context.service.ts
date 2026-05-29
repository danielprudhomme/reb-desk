import { collections } from '@src/db/collections.ts';
import { StrategyContext } from '@src/db/models/strategy-context.ts';
import { ExpertAdvisor } from '@shared/models/expert-advisor.ts';
import { Symbol } from '@shared/models/symbol.ts';
import { Timeframe } from '@shared/models/timeframe.ts';

export const strategyContextService = {
  findOrCreate(
    expert: ExpertAdvisor,
    symbol: Symbol,
    timeframe: Timeframe,
    leverage: number,
    capital: number,
  ): StrategyContext {
    const strategyContext: StrategyContext = {
      id: buildStrategyContextKey(expert, symbol, timeframe, leverage, capital),
      expert,
      symbol,
      timeframe,
      leverage,
      capital,
    };

    const existing = collections.StrategyContext().findOne({ id: strategyContext.id });

    if (existing) return existing;

    collections.StrategyContext().insert(strategyContext);
    return strategyContext;
  },
};

function buildStrategyContextKey(
  expert: ExpertAdvisor,
  symbol: Symbol,
  timeframe: Timeframe,
  leverage: number,
  capital: number,
): string {
  return [expert, symbol, timeframe, leverage, capital].join(':');
}
