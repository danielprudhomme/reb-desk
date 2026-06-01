import crypto from 'node:crypto';
import { AccountInsert, accounts } from '@src/db/schema/account.ts';
import { insertOne, updateById } from '@src/db/crud.ts';

export const accountService = {
  async upsert(input: Omit<AccountInsert, 'id'> & { id?: string }) {
    if (!input.id) {
      return await insertOne(accounts, {
        id: crypto.randomUUID(),
        name: input.name!,
        capital: input.capital!,
        leverage: input.leverage!,
      });
    }

    return await updateById(accounts, input.id, {
      name: input.name,
      capital: input.capital,
      leverage: input.leverage,
    });
  },
};
