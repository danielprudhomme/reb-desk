import { integer, primaryKey, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { backtests } from './index.ts';
import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';

export const backtestResults = sqliteTable(
  'backtest_result',
  {
    backtestId: text('backtest_id')
      .notNull()
      .references(() => backtests.id, {
        onDelete: 'cascade',
      }),

    type: text('type', {
      enum: ['short_term', 'long_term'],
    }).notNull(),

    position: integer('position').notNull(),

    result: real('result').notNull(),

    trades: integer('trades').notNull(),

    profitFactor: real('profit_factor').notNull(),

    resultPerTrade: real('result_per_trade').notNull(),

    drawdownAmount: real('drawdown_amount').notNull(),

    drawdownPercent: real('drawdown_percent').notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.backtestId, table.type, table.position],
    }),
  ],
);

export const backtestResultsRelations = relations(backtestResults, ({ one }) => ({
  backtest: one(backtests, {
    fields: [backtestResults.backtestId],
    references: [backtests.id],
  }),
}));

export type BacktestResult = InferSelectModel<typeof backtestResults>;
export type BacktestResultInsert = InferInsertModel<typeof backtestResults>;
