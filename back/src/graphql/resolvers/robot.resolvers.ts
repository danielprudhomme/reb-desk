import { robotService } from '@src/services/robot.service.ts';
import { robots } from '@src/db/schema/robot.ts';
import { db } from '@src/db/database.ts';
import { deleteById } from '@src/db/crud.ts';
import { InsertRobotInput } from '@src/models/insert-robot.input.ts';
import { UpdateRobotInput } from '@src/models/update-robot.input.ts';

export const robotResolvers = {
  Mutation: {
    deleteRobot: async (_: unknown, { id }: { id: string }) => deleteById(robots, id),
    insertRobot: (_: unknown, { input }: { input: InsertRobotInput }) => robotService.insert(input),
    insertRobots: async (_: unknown, { inputs }: { inputs: InsertRobotInput[] }) =>
      robotService.insertMany(inputs),
    updateRobot: (_: unknown, { input }: { input: UpdateRobotInput }) => robotService.update(input),
  },

  Query: {
    robotsByAccount: (_: unknown, { accountId }: { accountId: string }) =>
      db.query.robots.findMany({
        where: (robots, { eq }) => eq(robots.accountId, accountId),
        with: { parameterSet: true, strategyContext: true },
      }),
  },
};
