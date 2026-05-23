import { collections } from '@sec/db/collections.ts';
import { Robot } from '@sec/db/models/robot.ts';
import { RobotInput } from '@sec/models/robot.input.ts';
import { RobotConfiguration } from '@shared/models/robot-configuration.ts';
import crypto from 'node:crypto';

export const robotService = {
  createDrafts(accountId: string, inputs: RobotConfiguration[]): Robot[] {
    const existingDrafts = collections.Robot().find({ accountId, status: 'draft' });
    existingDrafts.forEach((draft) => collections.Robot().remove(draft));

    const created = inputs.map((input) =>
      this.upsert({ ...input, accountId, status: 'draft', parameters: [] }),
    );

    return created;
  },

  upsert(input: RobotInput): Robot {
    const robots = collections.Robot();

    const id = input.id ?? crypto.randomUUID();

    const robot: Robot = {
      id,
      accountId: input.accountId,
      expert: input.expert,
      timeframe: input.timeframe,
      symbol: input.symbol,
      status: input.status,
      parameters: input.parameters,
      strategySignature: this.createStrategySignature(input),
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

  createStrategySignature(input: RobotInput): string {
    const normalizedParameters = [...input.parameters]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((p) => ({ name: p.name.trim(), value: Number(p.value) }));

    const normalizedString = JSON.stringify({
      expert: input.expert,
      symbol: input.symbol,
      timeframe: input.timeframe,
      parameters: normalizedParameters,
    });

    return crypto.createHash('sha256').update(normalizedString).digest('hex');
  },
};
