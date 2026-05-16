import { collections } from '@sec/db/collections.ts';
import { robotService } from '@sec/services/robot.service.ts';
import { RobotInput } from '@sec/models/robot.input.ts';

export const robotResolvers = {
  Mutation: {
    upsertRobot: (_: unknown, { accountId, input }: { accountId: string; input: RobotInput }) =>
      robotService.upsert(accountId, input),
  },

  Query: {
    robotsByAccount: (_: unknown, { accountId }: { accountId: string }) =>
      collections.Robot().find({ accountId }),
  },
};
