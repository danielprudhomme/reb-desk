import { ExpertAdvisor } from '@shared/models/expert-advisor.ts';
import { StrategyContext } from '@shared/models/strategy-context.ts';
import { Symbol } from '@shared/models/symbol.ts';
import { Timeframe } from '@shared/models/timeframe.ts';
import { Tx } from '@src/db/database.ts';
import { StrategyContextDb, strategyContextsTable } from '@src/db/schema/strategy-context.ts';
import { eq } from 'drizzle-orm';

export const strategyContextService = {
  findOrCreateTx(
    tx: Tx,
    expert: ExpertAdvisor,
    symbol: Symbol,
    timeframe: Timeframe,
    leverage: number,
    capital: number,
  ): StrategyContextDb {
    const id = buildStrategyContextKey(expert, symbol, timeframe, leverage, capital);

    const existing = tx
      .select()
      .from(strategyContextsTable)
      .where(eq(strategyContextsTable.id, id))
      .get();

    if (existing) {
      return existing;
    }

    return tx
      .insert(strategyContextsTable)
      .values({
        id,
        expert,
        symbol,
        timeframe,
        leverage,
        capital,
      })
      .returning()
      .get();
  },

  mapDbToModel(db: StrategyContextDb): StrategyContext {
    return {
      id: db.id,
      expert: db.expert as ExpertAdvisor,
      symbol: db.symbol as Symbol,
      timeframe: db.timeframe as Timeframe,
      capital: db.capital,
      leverage: db.leverage,
    };
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
