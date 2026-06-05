import { sqliteTable, text, real, integer, index } from 'drizzle-orm/sqlite-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm/table';
import { backtestsTable } from './index.ts';
import { relations } from 'drizzle-orm/relations';

export const parameterSetsTable = sqliteTable(
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

export const parameterSetsRelations = relations(parameterSetsTable, ({ many }) => ({
  backtests: many(backtestsTable),
}));

export type ParameterSetDb = InferSelectModel<typeof parameterSetsTable>;
export type ParameterSetInsertDb = InferInsertModel<typeof parameterSetsTable>;
