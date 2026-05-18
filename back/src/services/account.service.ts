import crypto from 'node:crypto';
import { Account } from '@sec/db/models/account.ts';
import { AccountInput } from '@sec/models/account.input.ts';
import { collections } from '@sec/db/collections.ts';
import { robotService } from './robot.service.ts';

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

      if (input.robots?.length) {
        input.robots.forEach((robotInput) => {
          robotInput.accountId = newAccount.id;
          robotService.upsert(robotInput);
        });
      }

      return newAccount;
    }

    // UPDATE
    const existing = accounts.findOne({ id: input.id });

    if (!existing) {
      throw new Error('Account not found');
    }

    const updated = { ...existing, ...input } as Account;
    accounts.update(updated);

    // OPTIONAL robot bulk update
    if (input.robots) {
      // robotService.replaceForAccount(existing.id, input.robots);
    }

    return updated;
  },
};
