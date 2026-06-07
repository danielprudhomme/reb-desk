/* eslint-disable @typescript-eslint/no-explicit-any */
import { eq, InferInsertModel, InferSelectModel, Table } from 'drizzle-orm';
import { db } from './database.ts';

export function insertOne<T extends Table>(
  table: T,
  data: InferInsertModel<T>,
): InferSelectModel<T> {
  return db
    .insert(table)
    .values(data as any)
    .returning()
    .get() as InferSelectModel<T>;
}

export function updateById<T extends Table & { id: any }>(
  table: T,
  id: InferSelectModel<T>['id'],
  data: Partial<InferInsertModel<T>>,
): InferSelectModel<T> | undefined {
  return db
    .update(table)
    .set(data as any)
    .where(eq(table.id, id))
    .returning()
    .get() as InferSelectModel<T> | undefined;
}

export function deleteById<T extends Table & { id: any }>(
  table: T,
  id: InferSelectModel<T>['id'],
): boolean {
  db.delete(table).where(eq(table.id, id)).run();
  return true;
}
