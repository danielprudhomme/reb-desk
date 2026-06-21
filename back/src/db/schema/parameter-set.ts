import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm/table';
import { backtestsTable } from './index.ts';
import { relations } from 'drizzle-orm/relations';

export const parameterSetsTable = sqliteTable('parameter_set', {
  id: text('id').primaryKey(),
  parameters: text('parameters').notNull(),
});

export const parameterSetsRelations = relations(parameterSetsTable, ({ many }) => ({
  backtests: many(backtestsTable),
}));

export type ParameterSetDb = InferSelectModel<typeof parameterSetsTable>;
export type ParameterSetInsertDb = InferInsertModel<typeof parameterSetsTable>;
