import { sqliteTable, text, real, integer, index } from 'drizzle-orm/sqlite-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm/table';
import { backtests } from './index.ts';
import { relations } from 'drizzle-orm/relations';

export const parameterSets = sqliteTable(
  'parameter_set',
  {
    id: text('id').primaryKey(),

    parameters: text('parameters').notNull(),

    parametersHash: text('parameters_hash').notNull(),

    initLotSize: real('init_lot_size').notNull(),

    fixedLotSize: integer('fixed_lot_size', { mode: 'boolean' }).notNull(),
  },
  (table) => [index('idx_parameter_set_hash').on(table.parametersHash)],
);

export const parameterSetsRelations = relations(parameterSets, ({ many }) => ({
  backtests: many(backtests),
}));

export type ParameterSet = InferSelectModel<typeof parameterSets>;
export type ParameterSetInsert = InferInsertModel<typeof parameterSets>;
