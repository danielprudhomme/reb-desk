import crypto from 'node:crypto';
import { insertOne, updateById } from '@src/db/crud.ts';
import { AccountInsertDb, accountsTable } from '@src/db/schema/index.ts';

export const accountService = {
  upsert(input: Omit<AccountInsertDb, 'id'> & { id?: string }) {
    if (!input.id) {
      return insertOne(accountsTable, {
        id: crypto.randomUUID(),
        name: input.name!,
        capital: input.capital!,
        leverage: input.leverage!,
      });
    }

    return updateById(accountsTable, input.id, {
      name: input.name,
      capital: input.capital,
      leverage: input.leverage,
    });
  },
};
