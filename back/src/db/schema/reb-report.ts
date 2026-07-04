import { integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';
import { backtestsTable } from './index.ts';

export const rebReportsTable = sqliteTable(
  'reb_report',
  {
    id: text('id').primaryKey(),

    expert: text('expert').notNull(),
    symbol: text('symbol').notNull(),
    timeframe: text('timeframe').notNull(),

    leverage: integer('leverage').notNull(),
    capital: real('capital').notNull(),

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
  (table) => [uniqueIndex('idx_reb_report_fingerprint').on(table.fingerprint)],
);

export const rebReportsRelations = relations(rebReportsTable, ({ many }) => ({
  backtests: many(backtestsTable),
}));

export type RebReportDb = InferSelectModel<typeof rebReportsTable>;
export type RebReportInsertDb = InferInsertModel<typeof rebReportsTable>;
