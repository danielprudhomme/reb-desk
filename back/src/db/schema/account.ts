import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { Robot } from './index.ts';

export const accounts = sqliteTable('account', {
  id: text('id').primaryKey(),

  name: text('name').notNull(),

  capital: integer('capital').notNull(),

  leverage: integer('leverage').notNull(),
});

export type Account = InferSelectModel<typeof accounts>;
export type AccountInsert = InferInsertModel<typeof accounts>;
export type AccountWithRobots = Account & {
  robots: Robot[];
};
