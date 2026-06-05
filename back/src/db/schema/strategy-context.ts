import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const strategyContextsTable = sqliteTable('strategy_context', {
  id: text('id').primaryKey(),

  expert: text('expert').notNull(),
  symbol: text('symbol').notNull(),
  timeframe: text('timeframe').notNull(),

  leverage: integer('leverage').notNull(),
  capital: real('capital').notNull(),
});

export type StrategyContextDb = InferSelectModel<typeof strategyContextsTable>;
export type StrategyContextInsertDb = InferInsertModel<typeof strategyContextsTable>;
