import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm/table';

export const parameterSets = sqliteTable('parameter_set', {
  id: text('id').primaryKey(),

  strategyContextId: text('strategy_context_id').notNull(),

  fingerprint: text('fingerprint').notNull(),
});

export type ParameterSet = InferSelectModel<typeof parameterSets>;
export type ParameterSetInsert = InferInsertModel<typeof parameterSets>;
