import { EXPORTS_PATH } from '@src/config.ts';
import { fileService } from '../file.service.ts';
import { robotService } from '../robot.service.ts';

export async function generateProfileForAccount(accountId: string): Promise<void> {
  const robots = (await robotService.findByAccount(accountId)).filter(
    (robot) => robot.parameterSetId,
  );

  console.log('robots', robots.length);

  await fileService.ensureDirectory(EXPORTS_PATH);

  // robots.forEach(async (robot) => {
  // const content = buildRebFile(robot, projectName);
  // const filePath = path.join(EXPORTS_PATH, `${projectName}.reb`);
  // await writeFile(filePath, content, 'utf-8');
  // });
}
