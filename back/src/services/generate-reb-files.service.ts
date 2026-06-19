import { robotService } from './robot.service.ts';

export async function generateRebFilesForAccount(accountId: string): Promise<void> {
  // at first do it only with non SC robots
  const robots = (await robotService.findByAccount(accountId)).filter((robot) =>
    ['candleSuite', 'emaBb', 'rsiBreak'].includes(robot.strategyContext.expert),
  );

  console.log('generateRebFiles', accountId, robots.length);
}
