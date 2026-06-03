import { sqliteTable, text, real, primaryKey } from 'drizzle-orm/sqlite-core';
import { parameterSets } from './parameter-set.ts';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm/table';

export const parameters = sqliteTable(
  'parameter',
  {
    parameterSetId: text('parameter_set_id')
      .notNull()
      .references(() => parameterSets.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),

    name: text('name').notNull(),

    value: real('value').notNull(),
  },
  (table) => [primaryKey({ columns: [table.parameterSetId, table.name] })],
);

export type Parameter = InferSelectModel<typeof parameters>;
export type ParameterInsert = InferInsertModel<typeof parameters>;
