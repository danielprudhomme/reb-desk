import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { strategyContextsTable } from './strategy-context.ts';
import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';
import { backtestsTable } from './index.ts';

export const rebReportsTable = sqliteTable(
  'reb_report',
  {
    id: text('id').primaryKey(),

    strategyContextId: text('strategy_context_id')
      .notNull()
      .references(() => strategyContextsTable.id, {
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

export const rebReportsRelations = relations(rebReportsTable, ({ one, many }) => ({
  strategyContext: one(strategyContextsTable, {
    fields: [rebReportsTable.strategyContextId],
    references: [strategyContextsTable.id],
  }),

  backtests: many(backtestsTable),
}));

export type RebReportDb = InferSelectModel<typeof rebReportsTable>;
export type RebReportInsertDb = InferInsertModel<typeof rebReportsTable>;
