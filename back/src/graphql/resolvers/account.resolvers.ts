import { Account } from '@sec/db/models/account.ts';
import { collections } from '../../db/collections.ts';
export const accountResolvers = {
  Account: {
    robots: (account: Account) => {
      return collections.Robot().find({ accountId: account.id });
    },
  },

  Query: {
    accounts: () => {
      return collections.Account().find();
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    account: (_: any, { id }: { id: string }) => {
      return collections.Account().findOne({ id });
    },
  },
};
