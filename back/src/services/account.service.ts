import crypto from 'node:crypto';
import { Account } from '@sec/db/models/account.ts';
import { AccountInput } from '@sec/models/account.input.ts';
import { collections } from '@sec/db/collections.ts';
import { Robot } from '@sec/db/models/robot.ts';

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

  upsert(input: AccountInput): Account & { robots: Robot[] } {
    const accounts = collections.Account();
    // const robots = collections.Robot();

    const id = input.id ?? crypto.randomUUID();

    const account: Account = {
      id,
      name: input.name,
      capital: input.capital,
      leverage: input.leverage,
    };

    const existing = accounts.findOne({ id });

    if (existing) {
      accounts.update({
        ...existing,
        ...account,
      });
    } else {
      accounts.insert(account);
    }

    // const existingRobots = robots.find({ accountId: id });
    // const incomingRobotIds = input.robots.filter((r) => r.id).map((r) => r.id);

    // for (const robot of existingRobots) {
    //   if (!incomingRobotIds.includes(robot.id)) {
    //     robots.remove(robot);
    //   }
    // }

    // const savedRobots = input.robots.map((robot) => robotService.upsert(id, robot));

    return { ...account, robots: [] };
  },
};
