import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm/table';
import { backtests, strategyContexts } from './index.ts';
import { relations } from 'drizzle-orm/relations';

export const parameterSets = sqliteTable('parameter_set', {
  id: text('id').primaryKey(),

  strategyContextId: text('strategy_context_id').notNull(),

  fingerprint: text('fingerprint').notNull(),
});

export const parameterSetsRelations = relations(parameterSets, ({ one, many }) => ({
  strategyContext: one(strategyContexts, {
    fields: [parameterSets.strategyContextId],
    references: [strategyContexts.id],
  }),

  backtests: many(backtests),
}));

export type ParameterSet = InferSelectModel<typeof parameterSets>;
export type ParameterSetInsert = InferInsertModel<typeof parameterSets>;
