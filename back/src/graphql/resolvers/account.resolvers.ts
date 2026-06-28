import { deleteById } from '@src/db/crud.ts';
import { db } from '@src/db/database.ts';
import { AccountInsertDb, accountsTable } from '@src/db/schema/account.ts';
import { accountService } from '@src/services/account/account.service.ts';

export const accountResolvers = {
  Mutation: {
    upsertAccount: (_: unknown, { input }: { input: AccountInsertDb }) =>
      accountService.upsert(input),
    deleteAccount: async (_: unknown, { id }: { id: string }) => deleteById(accountsTable, id),
  },

  Query: {
    accounts: () => db.query.accountsTable.findMany(),
    account: (_: unknown, { id }: { id: string }) =>
      db.query.accountsTable.findFirst({ where: (accounts, { eq }) => eq(accounts.id, id) }),
  },
};
