import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const accountsTable = sqliteTable('account', {
  id: text('id').primaryKey(),

  name: text('name').notNull(),

  capital: integer('capital').notNull(),

  leverage: integer('leverage').notNull(),
});

export type AccountDb = InferSelectModel<typeof accountsTable>;
export type AccountInsertDb = InferInsertModel<typeof accountsTable>;
