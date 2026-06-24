import { index, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { strategyContextsTable } from './strategy-context.ts';
import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';
import { accountsTable, parameterSetsTable } from './index.ts';

export const robotsTable = sqliteTable(
  'robot',
  {
    id: text('id').primaryKey(),

    accountId: text('account_id')
      .notNull()
      .references(() => accountsTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),

    status: text('status').notNull(),

    magicNumber: text('magic_number'),

    strategyContextId: text('strategy_context_id')
      .notNull()
      .references(() => strategyContextsTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),

    parameterSetId: text('parameter_set_id').references(() => parameterSetsTable.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
  },
  (table) => [
    index('idx_robot_account').on(table.accountId),
    index('idx_robot_context').on(table.strategyContextId),
    index('idx_robot_parameter_set').on(table.parameterSetId),
    uniqueIndex('uq_robot_account_magic_number').on(table.accountId, table.magicNumber),
  ],
);

export const robotsRelations = relations(robotsTable, ({ one }) => ({
  account: one(accountsTable, {
    fields: [robotsTable.accountId],
    references: [accountsTable.id],
  }),

  strategyContext: one(strategyContextsTable, {
    fields: [robotsTable.strategyContextId],
    references: [strategyContextsTable.id],
  }),

  parameterSet: one(parameterSetsTable, {
    fields: [robotsTable.parameterSetId],
    references: [parameterSetsTable.id],
  }),
}));

export type RobotDb = InferSelectModel<typeof robotsTable>;
export type RobotInsertDb = InferInsertModel<typeof robotsTable>;
