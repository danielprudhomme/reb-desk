import crypto from 'node:crypto';
import { db, Tx } from '@src/db/database.ts';
import { and, eq } from 'drizzle-orm';
import { strategyContextService } from './strategy-context.service.ts';
import { InsertRobotInput } from '@src/models/insert-robot.input.ts';
import { UpdateRobotInput } from '@src/models/update-robot.input.ts';
import { accountsTable, RobotDb, robotsTable } from '@src/db/schema/index.ts';

export const robotService = {
  insertMany(inputs: InsertRobotInput[]): Promise<RobotDb[]> {
    const accountId = inputs[0]?.accountId;

    if (!accountId) {
      throw new Error('Account ID is required');
    }

    return db.transaction(async (tx) => {
      await tx
        .delete(robotsTable)
        .where(and(eq(robotsTable.accountId, accountId), eq(robotsTable.status, 'draft')));

      const created: RobotDb[] = [];
      for (const input of inputs) {
        const robot = await insertRobotTx(tx, input);
        created.push(robot);
      }

      return created;
    });
  },

  insert(input: InsertRobotInput): Promise<RobotDb> {
    return db.transaction((tx) => insertRobotTx(tx, input));
  },

  update(input: UpdateRobotInput): Promise<RobotDb> {
    return db.transaction(async (tx) => {
      const [updated] = await tx
        .update(robotsTable)
        .set(input)
        .where(eq(robotsTable.id, input.id))
        .returning();
      return updated;
    });
  },
};

async function insertRobotTx(tx: Tx, input: InsertRobotInput): Promise<RobotDb> {
  const account = await tx.query.accountsTable.findFirst({
    where: eq(accountsTable.id, input.accountId),
  });

  if (!account) {
    throw new Error('Account not found');
  }

  const strategyContext = await strategyContextService.findOrCreateTx(
    tx,
    input.expert,
    input.symbol,
    input.timeframe,
    account.leverage,
    account.capital,
  );

  const [created] = await tx
    .insert(robotsTable)
    .values({
      id: crypto.randomUUID(),
      accountId: input.accountId,
      status: 'draft',
      strategyContextId: strategyContext.id,
      parameterSetId: null,
    })
    .returning();

  return created;
}
