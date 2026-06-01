import { deleteById } from '@src/db/crud.ts';
import { db } from '@src/db/database.ts';
import { AccountInsert, accounts } from '@src/db/schema/account.ts';
import { accountService } from '@src/services/account.service.ts';

export const accountResolvers = {
  Mutation: {
    upsertAccount: (_: unknown, { input }: { input: AccountInsert }) =>
      accountService.upsert(input),
    deleteAccount: async (_: unknown, { id }: { id: string }) => deleteById(accounts, id),
  },

  Query: {
    accounts: () => db.query.accounts.findMany({ with: { robots: true } }),
    account: (_: unknown, { id }: { id: string }) =>
      db.query.accounts.findFirst({
        where: (accounts, { eq }) => eq(accounts.id, id),
        with: { robots: true },
      }),
  },
};
