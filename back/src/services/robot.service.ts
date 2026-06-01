import { Robot, robots } from '@src/db/schema/robot.ts';
import crypto from 'node:crypto';
import { db, Tx } from '@src/db/database.ts';
import { and, eq } from 'drizzle-orm';
import { accounts } from '@src/db/schema/account.ts';
import { strategyContextService } from './strategy-context.service.ts';
import { InsertRobotInput } from '@src/models/insert-robot.input.ts';
import { UpdateRobotInput } from '@src/models/update-robot.input.ts';

export const robotService = {
  insertMany(inputs: InsertRobotInput[]): Promise<Robot[]> {
    const accountId = inputs[0]?.accountId;

    if (!accountId) {
      throw new Error('Account ID is required');
    }

    return db.transaction(async (tx) => {
      await tx
        .delete(robots)
        .where(and(eq(robots.accountId, accountId), eq(robots.status, 'draft')));

      const created: Robot[] = [];
      for (const input of inputs) {
        const robot = await insertRobotTx(tx, input);
        created.push(robot);
      }

      return created;
    });
  },

  insert(input: InsertRobotInput): Promise<Robot> {
    return db.transaction((tx) => insertRobotTx(tx, input));
  },

  update(input: UpdateRobotInput): Promise<Robot> {
    return db.transaction(async (tx) => {
      const [updated] = await tx
        .update(robots)
        .set(input)
        .where(eq(robots.id, input.id))
        .returning();
      return updated;
    });
  },
};

async function insertRobotTx(tx: Tx, input: InsertRobotInput): Promise<Robot> {
  const account = await tx.query.accounts.findFirst({
    where: eq(accounts.id, input.accountId),
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
    .insert(robots)
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
