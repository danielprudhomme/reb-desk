import crypto from 'node:crypto';
import { db } from '@src/db/database.ts';
import { and, eq } from 'drizzle-orm';
import { strategyContextService } from './strategy-context.service.ts';
import { InsertRobotInput } from '@src/models/insert-robot.input.ts';
import { UpdateRobotInput } from '@src/models/update-robot.input.ts';
import { ParameterSetDb, RobotDb, robotsTable, StrategyContextDb } from '@src/db/schema/index.ts';
import { Robot } from '@shared/models/robot.ts';
import { parameterSetService } from './parameter-set.service.ts';
import { RobotStatus } from '@shared/models/robot-status.ts';
import { runImport } from './import.service.ts';
import { generateMagicNumber } from './magic-number.ts';
import { Timeframe } from '@shared/models/timeframe.ts';
import { ExpertAdvisor } from '@shared/models/expert-advisor.ts';
import { Symbol } from '@shared/models/symbol.ts';

export const robotService = {
  async findByAccount(accountId: string): Promise<Robot[]> {
    return (
      await db.query.robotsTable.findMany({
        where: (robots, { eq }) => eq(robots.accountId, accountId),
        with: {
          parameterSet: true,
          strategyContext: true,
        },
      })
    ).map((robot) => mapQueryToModel(robot));
  },

  async insertMany(inputs: InsertRobotInput[]): Promise<Robot[]> {
    const accountId = inputs[0]?.accountId;

    if (!accountId) {
      throw new Error('Account ID is required');
    }

    await db
      .delete(robotsTable)
      .where(and(eq(robotsTable.accountId, accountId), eq(robotsTable.status, 'draft')))
      .execute();

    const created: Robot[] = [];

    for (const input of inputs) {
      const robot = await this.insert(input);
      created.push(robot);
    }

    const ids = created.map((robot) => robot.id);
    return await findMany(ids);
  },

  async insert(input: InsertRobotInput): Promise<Robot> {
    const account = await db.query.accountsTable.findFirst({
      where: (accounts, { eq }) => eq(accounts.id, input.accountId),
    });

    if (!account) {
      throw new Error('Account not found');
    }

    const strategyContext = db.transaction((tx) => {
      return strategyContextService.findOrCreateTx(
        tx,
        input.expert,
        input.symbol,
        input.timeframe,
        account.leverage,
        account.capital,
      );
    });

    const magicNumber = await generateMagicNumber(input);

    const created = db
      .insert(robotsTable)
      .values({
        id: crypto.randomUUID(),
        accountId: input.accountId,
        status: 'draft',
        strategyContextId: strategyContext.id,
        parameterSetId: null,
        magicNumber,
      })
      .returning()
      .get();

    return await findOne(created.id);
  },

  async update(input: UpdateRobotInput): Promise<Robot> {
    const updated = db
      .update(robotsTable)
      .set({
        status: input.status,
        parameterSetId: input.parameterSetId,
      })
      .where(eq(robotsTable.id, input.id))
      .returning()
      .get();

    return await findOne(updated.id);
  },

  async importRebReports(accountId: string, folderPath: string): Promise<void> {
    const updateRobotWithParameterSetId = async (reportId: string, selectedPassNumber?: number) => {
      const report = await db.query.rebReportsTable.findFirst({
        where: (reports, { eq }) => eq(reports.id, reportId),
        with: { backtests: true },
      });

      const parameterSetId = report?.backtests.find(
        (backtest) => backtest.passNumber === selectedPassNumber,
      )?.parameterSetId;
      if (!parameterSetId) return;

      const existingRobot = await db.query.robotsTable.findFirst({
        where: (robots, { and, eq }) =>
          and(
            eq(robots.accountId, accountId),
            eq(robots.strategyContextId, report.strategyContextId),
          ),
      });

      if (existingRobot) {
        await db
          .update(robotsTable)
          .set({ parameterSetId, status: parameterSetId ? 'configured' : 'draft' })
          .where(eq(robotsTable.id, existingRobot.id))
          .execute();
      } else {
        await db
          .insert(robotsTable)
          .values({
            id: crypto.randomUUID(),
            accountId,
            status: parameterSetId ? 'configured' : 'draft',
            strategyContextId: report.strategyContextId,
            parameterSetId,
          })
          .execute();
      }
    };

    await runImport(folderPath, updateRobotWithParameterSetId);
  },

  async setMagicNumbers(): Promise<void> {
    const robotsWithoutMagicNumber = await db.query.robotsTable.findMany({
      where: (robots, { isNull }) => isNull(robots.magicNumber),
      with: { strategyContext: true },
    });

    robotsWithoutMagicNumber.forEach(async (robot) => {
      const magicNumber = await generateMagicNumber({
        accountId: robot.accountId,
        symbol: robot.strategyContext.symbol as Symbol,
        timeframe: robot.strategyContext.timeframe as Timeframe,
        expert: robot.strategyContext.expert as ExpertAdvisor,
      });

      db.update(robotsTable).set({ magicNumber }).where(eq(robotsTable.id, robot.id)).execute();
    });
  },
};

async function findMany(ids: string[]): Promise<Robot[]> {
  return (
    await db.query.robotsTable.findMany({
      where: (robots, { inArray }) => inArray(robots.id, ids),
      with: {
        parameterSet: true,
        strategyContext: true,
      },
    })
  ).map((robot) => mapQueryToModel(robot));
}

async function findOne(id: string): Promise<Robot> {
  return (await findMany([id]))[0];
}

function mapQueryToModel(
  robot: RobotDb & { strategyContext: StrategyContextDb } & { parameterSet: ParameterSetDb | null },
): Robot {
  return {
    id: robot.id,
    accountId: robot.accountId,
    status: robot.status as RobotStatus,
    strategyContext: strategyContextService.mapDbToModel(robot.strategyContext),
    parameterSetId: robot.parameterSetId ?? undefined,
    parameterSet: robot.parameterSet
      ? parameterSetService.mapDbToModel(robot.parameterSet)
      : undefined,
  };
}
