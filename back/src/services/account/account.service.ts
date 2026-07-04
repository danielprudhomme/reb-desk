import crypto from 'node:crypto';
import { insertOne, updateById } from '@src/db/crud.ts';
import { AccountInsertDb, accountsTable, robotsTable } from '@src/db/schema/index.ts';
import { robotService } from '../robot.service.ts';
import { db } from '@src/db/database.ts';
import { eq } from 'drizzle-orm';
import { runImport } from '../import.service.ts';
import { rebReportGenerator } from '../reb-report/reb-report.generator.ts';
import { profileGenerator } from './profile.generator.ts';
import { generateMagicNumber } from '../magic-number.ts';
import { ExpertAdvisor } from '@shared/models/expert-advisor.ts';
import { Timeframe } from '@shared/models/timeframe.ts';
import { Symbol } from '@shared/models/symbol.ts';

export const accountService = {
  async createRebReports(accountId: string): Promise<void> {
    const account = await db.query.accountsTable.findFirst({
      where: (accounts, { eq }) => eq(accounts.id, accountId),
    });

    if (!account) {
      throw new Error('Account not found');
    }

    // at first do it only with non SC robots
    const robots = (await robotService.findByAccount(accountId)).filter((robot) =>
      ['candleSuite', 'emaBb', 'rsiBreak'].includes(robot.expert),
    );

    robots.forEach(
      async (robot) =>
        await rebReportGenerator.createRebReport(robot, account.capital, account.leverage),
    );
  },
  async generateProfile(accountId: string): Promise<void> {
    const robots = (await robotService.findByAccount(accountId)).filter(
      (robot) => robot.parameterSetId,
    );

    robots.forEach(async (robot) => await profileGenerator.generateProfile(robot));
  },
  async syncRebReportsToRobots(accountId: string, folderPath: string): Promise<void> {
    const existingRobots = await robotService.findByAccount(accountId);

    const upsertRobot = async (reportId: string, selectedPassNumber?: number) => {
      const report = await db.query.rebReportsTable.findFirst({
        where: (reports, { eq }) => eq(reports.id, reportId),
        with: { backtests: true },
      });

      const parameterSetId = report?.backtests.find(
        (backtest) => backtest.passNumber === selectedPassNumber,
      )?.parameterSetId;
      if (!parameterSetId) return;

      const existingRobot = existingRobots.find(
        (robot) =>
          robot.expert === report.expert &&
          robot.symbol === report.symbol &&
          robot.timeframe === report.timeframe,
      );

      if (existingRobot) {
        await db
          .update(robotsTable)
          .set({ parameterSetId, status: parameterSetId ? 'configured' : 'draft' })
          .where(eq(robotsTable.id, existingRobot.id))
          .execute();
      } else {
        const magicNumber = await generateMagicNumber({
          accountId,
          expert: report.expert as ExpertAdvisor,
          symbol: report.symbol as Symbol,
          timeframe: report.timeframe as Timeframe,
        });

        await db
          .insert(robotsTable)
          .values({
            id: crypto.randomUUID(),
            accountId,
            status: parameterSetId ? 'configured' : 'draft',
            expert: report.expert,
            symbol: report.symbol,
            timeframe: report.timeframe,
            parameterSetId,
            magicNumber,
          })
          .execute();
      }
    };

    await runImport(folderPath, upsertRobot);
  },
  upsert(input: Omit<AccountInsertDb, 'id'> & { id?: string }) {
    if (!input.id) {
      return insertOne(accountsTable, {
        id: crypto.randomUUID(),
        name: input.name!,
        capital: input.capital!,
        leverage: input.leverage!,
      });
    }

    return updateById(accountsTable, input.id, {
      name: input.name,
      capital: input.capital,
      leverage: input.leverage,
    });
  },
};
