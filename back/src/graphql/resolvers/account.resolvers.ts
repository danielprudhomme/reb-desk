import { collections } from '@sec/db/collections.ts';
import { Account } from '@sec/db/models/account.ts';
import { AccountInput } from '@sec/models/account.input.ts';
import { accountService } from '@sec/services/account.service.ts';

export const accountResolvers = {
  Mutation: {
    upsertAccount: (_: unknown, { input }: { input: AccountInput }) => {
      return accountService.upsert(input);
    },
  },

  Query: {
    accounts: () => {
      return accountService.getAll();
    },

    account: (_: unknown, { id }: { id: string }) => {
      return accountService.getById(id);
    },
  },

  Account: {
    robots: (account: Account) => {
      return collections.Robot().find({
        accountId: account.id,
      });
    },
  },
};
