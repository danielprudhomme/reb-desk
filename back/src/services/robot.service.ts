import crypto from 'node:crypto';
import { db } from '@src/db/database.ts';
import { and, eq, isNull } from 'drizzle-orm';
import { InsertRobotInput } from '@src/models/insert-robot.input.ts';
import { UpdateRobotInput } from '@src/models/update-robot.input.ts';
import {
  accountsTable,
  backtestResultsTable,
  backtestsTable,
  ParameterSetDb,
  parameterSetsTable,
  rebReportsTable,
  RobotDb,
  robotsTable,
} from '@src/db/schema/index.ts';
import { Robot } from '@shared/models/robot.ts';
import { parameterSetService } from './parameter-set.service.ts';
import { RobotStatus } from '@shared/models/robot-status.ts';
import { generateMagicNumber } from './magic-number.ts';
import { Timeframe } from '@shared/models/timeframe.ts';
import { ExpertAdvisor } from '@shared/models/expert-advisor.ts';
import { Symbol } from '@shared/models/symbol.ts';
import { DiversifyRobotsInput } from '@src/models/diversify-robots-input.ts';
import { diversifyRobots } from './diversify-robots.ts';
import { RobotConfiguration } from '@shared/models/robot-configuration.ts';
import { TimeUnit } from '@shared/models/time-unit.ts';

export const robotService = {
  async findByAccountWithBacktests(accountId: string): Promise<Robot[]> {
    const rows = await db
      .select({
        robot: robotsTable,
        account: accountsTable,
        parameterSet: parameterSetsTable,
        backtest: backtestsTable,
        report: rebReportsTable,
        results: backtestResultsTable,
      })
      .from(robotsTable)
      .innerJoin(accountsTable, eq(accountsTable.id, robotsTable.accountId))
      .leftJoin(parameterSetsTable, eq(parameterSetsTable.id, robotsTable.parameterSetId))
      .leftJoin(backtestsTable, eq(backtestsTable.parameterSetId, parameterSetsTable.id))
      .leftJoin(rebReportsTable, eq(rebReportsTable.id, backtestsTable.reportId))
      .leftJoin(backtestResultsTable, eq(backtestResultsTable.backtestId, backtestsTable.id))
      .where(
        and(
          eq(robotsTable.accountId, accountId),
          eq(rebReportsTable.expert, robotsTable.expert),
          eq(rebReportsTable.symbol, robotsTable.symbol),
          eq(rebReportsTable.timeframe, robotsTable.timeframe),
          eq(rebReportsTable.leverage, accountsTable.leverage),
          eq(rebReportsTable.capital, accountsTable.capital),
        ),
      );

    const robots = new Map<string, Robot>();

    for (const row of rows) {
      let robot = robots.get(row.robot.id);

      if (!robot) {
        robot = {
          id: row.robot.id,
          accountId: row.robot.accountId,
          status: row.robot.status as RobotStatus,
          expert: row.robot.expert as ExpertAdvisor,
          timeframe: row.robot.timeframe as Timeframe,
          symbol: row.robot.symbol as Symbol,
          magicNumber: row.robot.magicNumber ?? undefined,
          parameterSet: row.parameterSet
            ? parameterSetService.mapDbToModel(row.parameterSet)
            : undefined,
        };

        robots.set(row.robot.id, robot);
      }

      if (!row.backtest || !robot.parameterSet) {
        continue;
      }

      let backtest = robot.parameterSet.backtests.find((x) => x.id === row.backtest!.id);

      if (!backtest) {
        backtest = {
          id: row.backtest.id,
          reportId: row.backtest.reportId,
          passNumber: row.backtest.passNumber,
          shortTermCount: row.report!.shortTermCount,
          shortTermUnit: row.report!.shortTermUnit as TimeUnit,
          shortTermDuration: row.report!.shortTermDuration,
          longTermUnit: row.report!.longTermUnit as TimeUnit,
          longTermDuration: row.report!.longTermDuration,
          shortTermResults: [],
          longTermResults: [],
        };

        robot.parameterSet.backtests.push(backtest);
      }

      if (row.results) {
        if (row.results.type === 'short_term') {
          backtest.shortTermResults.push(row.results);
        }
        if (row.results.type === 'long_term') {
          backtest.longTermResults.push(row.results);
        }
      }
    }

    return [...robots.values()];
  },

  async findByAccount(accountId: string): Promise<Robot[]> {
    return (
      await db.query.robotsTable.findMany({
        where: (robots, { eq }) => eq(robots.accountId, accountId),
        with: { parameterSet: true },
      })
    ).map((robot) => mapQueryToModel(robot));
  },

  async findRobotsWithoutReport(accountId: string): Promise<Robot[]> {
    const rows = await db
      .select({ robot: robotsTable })
      .from(robotsTable)
      .innerJoin(accountsTable, eq(accountsTable.id, robotsTable.accountId))
      .leftJoin(
        rebReportsTable,
        and(
          eq(rebReportsTable.expert, robotsTable.expert),
          eq(rebReportsTable.timeframe, robotsTable.timeframe),
          eq(rebReportsTable.symbol, robotsTable.symbol),
          eq(rebReportsTable.leverage, accountsTable.leverage),
          eq(rebReportsTable.capital, accountsTable.capital),
        ),
      )
      .where(
        and(
          eq(accountsTable.id, accountId),
          isNull(robotsTable.parameterSetId),
          isNull(rebReportsTable.id),
        ),
      );

    return rows.map(({ robot }) =>
      mapQueryToModel(robot as RobotDb & { parameterSet: ParameterSetDb | null }),
    );
  },

  async insert(input: InsertRobotInput): Promise<Robot> {
    const account = await db.query.accountsTable.findFirst({
      where: (accounts, { eq }) => eq(accounts.id, input.accountId),
    });

    if (!account) {
      throw new Error('Account not found');
    }

    const magicNumber = await generateMagicNumber(input);

    const created = db
      .insert(robotsTable)
      .values({
        id: crypto.randomUUID(),
        accountId: input.accountId,
        status: 'draft',
        expert: input.expert,
        timeframe: input.timeframe,
        symbol: input.symbol,
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

  async diversify(input: DiversifyRobotsInput): Promise<Robot[]> {
    const currentAccountRobots = (await db.query.robotsTable.findMany({
      where: (robots, { eq }) => eq(robots.accountId, input.accountId),
    })) as RobotConfiguration[];
    const allAccountsRobots = (await db.query.robotsTable.findMany({})) as RobotConfiguration[];

    const newRobots = diversifyRobots(
      currentAccountRobots,
      allAccountsRobots,
      input.timeframes,
      input.symbols,
      input.distribution,
    );

    const created: Robot[] = [];

    for (const newRobot of newRobots) {
      const robot = await this.insert({ ...newRobot, accountId: input.accountId });
      created.push(robot);
    }

    return created;
  },
};

async function findOne(id: string): Promise<Robot> {
  const robot = await db.query.robotsTable.findFirst({
    where: (robots, { eq }) => eq(robots.id, id),
    with: { parameterSet: true },
  });
  return mapQueryToModel(robot!);
}

function mapQueryToModel(robot: RobotDb & { parameterSet: ParameterSetDb | null }): Robot {
  return {
    id: robot.id,
    accountId: robot.accountId,
    status: robot.status as RobotStatus,
    expert: robot.expert as ExpertAdvisor,
    timeframe: robot.timeframe as Timeframe,
    symbol: robot.symbol as Symbol,
    parameterSetId: robot.parameterSetId ?? undefined,
    parameterSet: robot.parameterSet
      ? parameterSetService.mapDbToModel(robot.parameterSet)
      : undefined,
    magicNumber: robot.magicNumber ?? undefined,
  };
}
