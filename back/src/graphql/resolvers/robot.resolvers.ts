import { robotService } from '@src/services/robot.service.ts';
import { deleteById } from '@src/db/crud.ts';
import { InsertRobotInput } from '@src/models/insert-robot.input.ts';
import { UpdateRobotInput } from '@src/models/update-robot.input.ts';
import { robotsTable } from '@src/db/schema/index.ts';
import { Robot } from '@shared/models/robot.ts';
import { DiversifyRobotsInput } from '@src/models/diversify-robots-input.ts';

export const robotResolvers = {
  Mutation: {
    deleteRobot: async (_: unknown, { id }: { id: string }): Promise<boolean> =>
      deleteById(robotsTable, id),
    diversifyRobots: (_: unknown, { input }: { input: DiversifyRobotsInput }) =>
      robotService.diversify(input),
    insertRobot: (_: unknown, { input }: { input: InsertRobotInput }): Promise<Robot> =>
      robotService.insert(input),
    updateRobot: (_: unknown, { input }: { input: UpdateRobotInput }): Promise<Robot> =>
      robotService.update(input),
  },

  Query: {
    robotsByAccount: (_: unknown, { accountId }: { accountId: string }) =>
      robotService.findByAccount(accountId),
  },
};
