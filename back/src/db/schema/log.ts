import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const logsTable = sqliteTable('log', {
  id: text('id').primaryKey(),

  level: text('level').notNull(),

  source: text('source').notNull(),

  message: text('message').notNull(),

  data: text('data'),

  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export type LogDb = InferSelectModel<typeof logsTable>;
export type LogInsertDb = InferInsertModel<typeof logsTable>;
