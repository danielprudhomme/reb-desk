import { ExpertAdvisor } from '@shared/models/expert-advisor.ts';
import { Symbol } from '@shared/models/symbol.ts';
import { Timeframe } from '@shared/models/timeframe.ts';
import { Tx } from '@src/db/database.ts';
import { StrategyContextDb, strategyContextsTable } from '@src/db/schema/strategy-context.ts';

export const strategyContextService = {
  async findOrCreateTx(
    tx: Tx,
    expert: ExpertAdvisor,
    symbol: Symbol,
    timeframe: Timeframe,
    leverage: number,
    capital: number,
  ): Promise<StrategyContextDb> {
    const id = buildStrategyContextKey(expert, symbol, timeframe, leverage, capital);

    const existing = await tx.query.strategyContextsTable.findFirst({
      where: (t, { eq }) => eq(t.id, id),
    });

    if (existing) return existing;

    const [created] = await tx
      .insert(strategyContextsTable)
      .values({
        id,
        expert,
        symbol,
        timeframe,
        leverage,
        capital,
      })
      .returning();

    return created;
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
