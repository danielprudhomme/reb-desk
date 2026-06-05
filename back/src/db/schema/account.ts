import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { robotsTable } from './robot.ts';

export const accountsTable = sqliteTable('account', {
  id: text('id').primaryKey(),

  name: text('name').notNull(),

  capital: integer('capital').notNull(),

  leverage: integer('leverage').notNull(),
});

export const accountsRelations = relations(accountsTable, ({ many }) => ({
  robots: many(robotsTable),
}));

export type AccountDb = InferSelectModel<typeof accountsTable>;
export type AccountInsertDb = InferInsertModel<typeof accountsTable>;
