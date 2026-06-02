import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { strategyContexts } from './strategy-context.ts';
import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';
import { Backtest, backtests } from './backtest.ts';

export const rebReports = sqliteTable(
  'reb_report',
  {
    id: text('id').primaryKey(),

    strategyContextId: text('strategy_context_id')
      .notNull()
      .references(() => strategyContexts.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),

    fingerprint: text('fingerprint').notNull(),

    importStatus: text('import_status').notNull(),

    path: text('path').notNull(),

    model: text('model').notNull(),

    startDate: text('start_date').notNull(),

    lastValidatedDate: text('last_validated_date'),

    shortTermCount: integer('short_term_count').notNull(),

    shortTermDuration: integer('short_term_duration').notNull(),

    shortTermUnit: text('short_term_unit').notNull(),

    longTermDuration: integer('long_term_duration').notNull(),

    longTermUnit: text('long_term_unit').notNull(),
  },
  (table) => [
    uniqueIndex('idx_reb_report_fingerprint').on(table.fingerprint),

    index('idx_reb_report_strategy_context').on(table.strategyContextId),
  ],
);

export const rebReportsRelations = relations(rebReports, ({ one, many }) => ({
  strategyContext: one(strategyContexts, {
    fields: [rebReports.strategyContextId],
    references: [strategyContexts.id],
  }),

  backtests: many(backtests),
}));

export type RebReport = InferSelectModel<typeof rebReports>;
export type RebReportInsert = InferInsertModel<typeof rebReports>;
export type RebReportWithBacktests = RebReport & {
  backtests: Backtest[];
};
