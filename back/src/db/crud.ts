/* eslint-disable @typescript-eslint/no-explicit-any */
import { eq, type Table } from 'drizzle-orm';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { db } from './database.ts';

export async function insertOne<T extends Table>(
  table: T,
  data: InferInsertModel<T>,
): Promise<InferSelectModel<T>> {
  const [created] = await db
    .insert(table)
    .values(data as any)
    .returning();
  return created as any;
}

export async function updateById<T extends Table & { id: any }>(
  table: T,
  id: InferSelectModel<T>['id'],
  data: Partial<InferInsertModel<T>>,
): Promise<InferSelectModel<T> | undefined> {
  const [updated] = await db
    .update(table)
    .set(data as any)
    .where(eq(table.id, id))
    .returning();

  return updated as any;
}

export async function deleteById<T extends Table & { id: any }>(
  table: T,
  id: InferSelectModel<T>['id'],
): Promise<void> {
  await db.delete(table).where(eq(table.id, id));
}
