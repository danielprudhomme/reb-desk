import { collections } from '@sec/db/collections.ts';
import { Robot } from '@sec/db/models/robot.ts';
import { RobotInput } from '@sec/models/robot.input.ts';
import crypto from 'node:crypto';

export const robotService = {
  upsert(accountId: string, input: RobotInput): Robot {
    const robots = collections.Robot();

    const id = input.id ?? crypto.randomUUID();

    const strategySignature = this.createStrategySignature(input);

    const robot: Robot = {
      id,

      accountId,

      expert: input.expert,
      timeframe: input.timeframe,
      symbol: input.symbol,

      status: input.status,

      parameters: input.parameters,

      strategySignature,
    };

    const existing = robots.findOne({ id });

    if (existing) {
      robots.update({
        ...existing,
        ...robot,
      });

      return robot;
    }

    const duplicate = robots.findOne({
      strategySignature,
    });

    if (duplicate) {
      throw new Error(`Robot strategy already exists`);
    }

    robots.insert(robot);

    return robot;
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
