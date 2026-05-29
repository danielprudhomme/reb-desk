import { collections } from '@src/db/collections.ts';
import { Robot } from '@src/db/models/robot.ts';
import { RobotInput } from '@src/models/robot.input.ts';
import { RobotConfiguration } from '@shared/models/robot-configuration.ts';
import crypto from 'node:crypto';
import { strategyContextService } from './strategy-context.service.ts';

export const robotService = {
  createDrafts(accountId: string, inputs: RobotConfiguration[]): Robot[] {
    const existingDrafts = collections.Robot().find({ accountId, status: 'draft' });
    existingDrafts.forEach((draft) => collections.Robot().remove(draft));

    const created = inputs.map((input) => this.upsert({ ...input, accountId, status: 'draft' }));
    return created;
  },

  upsert(input: RobotInput): Robot {
    const robots = collections.Robot();
    const account = collections.Account().findOne({ id: input.accountId });

    if (!account) {
      throw new Error('Account not found');
    }

    const strategyContext = strategyContextService.findOrCreate(
      input.expert,
      input.symbol,
      input.timeframe,
      account?.leverage ?? 1,
      account?.capital ?? 10000,
    );

    const id = input.id ?? crypto.randomUUID();

    const robot: Robot = {
      id,
      accountId: input.accountId,
      status: input.status,
      strategyContextId: strategyContext.id,
      parameterSetId: input.parameterSetId,
    };

    const existing = robots.findOne({ id });

    if (existing) {
      robots.update({
        ...existing,
        ...robot,
      });

      return robot;
    }

    robots.insert(robot);

    return robot;
  },

  delete(id: string): boolean {
    const robot = collections.Robot().findOne({ id });

    if (!robot) {
      throw new Error('Robot not found');
    }

    collections.Robot().remove(robot);
    return true;
  },
};
