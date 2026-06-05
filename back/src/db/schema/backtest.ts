import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';
import { backtestResultsTable, parameterSetsTable, rebReportsTable } from './index.ts';

export const backtestsTable = sqliteTable(
  'backtest',
  {
    id: text('id').primaryKey(),

    parameterSetId: text('parameter_set_id')
      .notNull()
      .references(() => parameterSetsTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),

    reportId: text('report_id')
      .notNull()
      .references(() => rebReportsTable.id, {
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

export const backtestsRelations = relations(backtestsTable, ({ one, many }) => ({
  report: one(rebReportsTable, {
    fields: [backtestsTable.reportId],
    references: [rebReportsTable.id],
  }),

  parameterSet: one(parameterSetsTable, {
    fields: [backtestsTable.parameterSetId],
    references: [parameterSetsTable.id],
  }),

  results: many(backtestResultsTable),
}));

export type BacktestDb = InferSelectModel<typeof backtestsTable>;
export type BacktestInsertDb = InferInsertModel<typeof backtestsTable>;
