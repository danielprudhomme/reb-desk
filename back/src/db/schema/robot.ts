import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { strategyContexts } from './strategy-context.ts';
import { parameterSets } from './parameter-set.ts';
import { accounts } from './account.ts';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export const robots = sqliteTable(
  'robot',
  {
    id: text('id').primaryKey(),

    accountId: text('account_id')
      .notNull()
      .references(() => accounts.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),

    status: text('status').notNull(),

    strategyContextId: text('strategy_context_id')
      .notNull()
      .references(() => strategyContexts.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),

    parameterSetId: text('parameter_set_id').references(() => parameterSets.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
  },
  (table) => ({
    accountIdx: index('idx_robot_account').on(table.accountId),

    contextIdx: index('idx_robot_context').on(table.strategyContextId),

    parameterSetIdx: index('idx_robot_parameter_set').on(table.parameterSetId),
  }),
);

export type Robot = InferSelectModel<typeof robots>;
export type RobotInsert = InferInsertModel<typeof robots>;
