import { collections } from '@sec/db/collections.ts';
import { robotService } from '@sec/services/robot.service.ts';
import { RobotInput } from '@sec/models/robot.input.ts';
import { RobotConfiguration } from '@shared/models/robot-configuration.ts';

export const robotResolvers = {
  Mutation: {
    upsertRobot: (_: unknown, { input }: { input: RobotInput }) => robotService.upsert(input),
    deleteRobot: async (_: unknown, { id }: { id: string }) => robotService.delete(id),
    createDraftRobots: async (
      _: unknown,
      { accountId, inputs }: { accountId: string; inputs: RobotConfiguration[] },
    ) => robotService.createDrafts(accountId, inputs),
  },

  Query: {
    robotsByAccount: (_: unknown, { accountId }: { accountId: string }) =>
      collections.Robot().find({ accountId }),
  },
};
