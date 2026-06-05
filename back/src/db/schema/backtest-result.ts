import { integer, primaryKey, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';
import { backtestsTable } from './backtest.ts';

export const backtestResultsTable = sqliteTable(
  'backtest_result',
  {
    backtestId: text('backtest_id')
      .notNull()
      .references(() => backtestsTable.id, {
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

export const backtestResultsRelations = relations(backtestResultsTable, ({ one }) => ({
  backtest: one(backtestsTable, {
    fields: [backtestResultsTable.backtestId],
    references: [backtestsTable.id],
  }),
}));

export type BacktestResultDb = InferSelectModel<typeof backtestResultsTable>;
export type BacktestResultInsertDb = InferInsertModel<typeof backtestResultsTable>;
