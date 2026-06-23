import crypto from 'node:crypto';
import { db, Tx } from '@src/db/database.ts';
import { and, eq } from 'drizzle-orm';
import { strategyContextService } from './strategy-context.service.ts';
import { InsertRobotInput } from '@src/models/insert-robot.input.ts';
import { UpdateRobotInput } from '@src/models/update-robot.input.ts';
import {
  accountsTable,
  ParameterSetDb,
  RobotDb,
  robotsTable,
  StrategyContextDb,
} from '@src/db/schema/index.ts';
import { Robot } from '@shared/models/robot.ts';
import { parameterSetService } from './parameter-set.service.ts';
import { RobotStatus } from '@shared/models/robot-status.ts';
import { runImport } from './import.service.ts';

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

    const created = db.transaction((tx) => {
      tx.delete(robotsTable)
        .where(and(eq(robotsTable.accountId, accountId), eq(robotsTable.status, 'draft')))
        .run();

      const created: RobotDb[] = [];

      for (const input of inputs) {
        const robot = insertRobotTx(tx, input);
        created.push(robot);
      }

      return created;
    });

    const ids = created.map((robot) => robot.id);
    return await findMany(ids);
  },

  async insert(input: InsertRobotInput): Promise<Robot> {
    const created = db.transaction((tx) => insertRobotTx(tx, input));

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
};

function insertRobotTx(tx: Tx, input: InsertRobotInput): RobotDb {
  const account = tx
    .select()
    .from(accountsTable)
    .where(eq(accountsTable.id, input.accountId))
    .get();

  if (!account) {
    throw new Error('Account not found');
  }

  const strategyContext = strategyContextService.findOrCreateTx(
    tx,
    input.expert,
    input.symbol,
    input.timeframe,
    account.leverage,
    account.capital,
  );

  return tx
    .insert(robotsTable)
    .values({
      id: crypto.randomUUID(),
      accountId: input.accountId,
      status: 'draft',
      strategyContextId: strategyContext.id,
      parameterSetId: null,
    })
    .returning()
    .get();
}

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
