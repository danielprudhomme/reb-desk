import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { parameterSets } from './parameter-set.ts';
import { rebReports } from './reb-report.ts';
import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';
import { backtestResults } from './backtest-result.ts';

export const backtests = sqliteTable(
  'backtest',
  {
    id: text('id').primaryKey(),

    parameterSetId: text('parameter_set_id')
      .notNull()
      .references(() => parameterSets.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),

    reportId: text('report_id')
      .notNull()
      .references(() => rebReports.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),

    passNumber: integer('pass_number').notNull(),
  },
  (table) => [
    index('idx_backtest_parameter_set').on(table.parameterSetId),

    index('idx_backtest_report').on(table.reportId),
  ],
);

export const backtestsRelations = relations(backtests, ({ one, many }) => ({
  report: one(rebReports, {
    fields: [backtests.reportId],
    references: [rebReports.id],
  }),

  parameterSet: one(parameterSets, {
    fields: [backtests.parameterSetId],
    references: [parameterSets.id],
  }),

  results: many(backtestResults),
}));

export type Backtest = InferSelectModel<typeof backtests>;
export type BacktestInsert = InferInsertModel<typeof backtests>;
