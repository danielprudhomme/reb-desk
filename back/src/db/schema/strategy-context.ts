import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const strategyContexts = sqliteTable('strategy_context', {
  id: text('id').primaryKey(),

  expert: text('expert').notNull(),
  symbol: text('symbol').notNull(),
  timeframe: text('timeframe').notNull(),

  leverage: integer('leverage').notNull(),
  capital: real('capital').notNull(),
});

export type StrategyContext = InferSelectModel<typeof strategyContexts>;
export type StrategyContextInsert = InferInsertModel<typeof strategyContexts>;
