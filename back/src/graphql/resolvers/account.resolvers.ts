import { collections } from '@sec/db/collections.ts';
import { Account } from '@sec/db/models/account.ts';
import { AccountInput } from '@sec/models/account.input.ts';
import { accountService } from '@sec/services/account.service.ts';

export const accountResolvers = {
  Mutation: {
    upsertAccount: (_: unknown, { input }: { input: AccountInput }) => accountService.upsert(input),
    deleteAccount: async (_: unknown, { id }: { id: string }) => accountService.delete(id),
  },

  Query: {
    accounts: () => accountService.getAll(),
    account: (_: unknown, { id }: { id: string }) => accountService.getById(id),
  },

  Account: {
    robots: (account: Account) => collections.Robot().find({ accountId: account.id }),
  },
};
