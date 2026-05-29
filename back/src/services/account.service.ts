import crypto from 'node:crypto';
import { Account } from '@src/db/models/account.ts';
import { AccountInput } from '@src/models/account.input.ts';
import { collections } from '@src/db/collections.ts';

export const accountService = {
  getAll() {
    return collections.Account().find();
  },

  getById(id: string) {
    return collections.Account().findOne({ id });
  },

  delete(id: string): boolean {
    const account = this.getById(id);

    if (!account) {
      throw new Error('Account not found');
    }

    collections.Account().remove(account);
    return true;
  },

  upsert(input: AccountInput) {
    const accounts = collections.Account();

    // CREATE
    if (!input.id) {
      const newAccount = {
        id: crypto.randomUUID(),
        name: input.name,
        capital: input.capital,
        leverage: input.leverage,
      };

      accounts.insert(newAccount);

      return newAccount;
    }

    // UPDATE
    const existing = accounts.findOne({ id: input.id });

    if (!existing) {
      throw new Error('Account not found');
    }

    const updated = { ...existing, ...input } as Account;
    accounts.update(updated);

    return updated;
  },
};
