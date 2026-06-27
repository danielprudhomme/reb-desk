import { EXPORTS_PATH } from '@src/config.ts';
import { fileService } from '../file.service.ts';
import { robotService } from '../robot.service.ts';
import path from 'path';
import expertConst from '@shared/constants/expert.constants.ts';
import { writeFile } from 'fs/promises';
import { buildParametersInFile } from './parameters-file.service.ts';
import { Robot } from '@shared/models/robot.ts';
import { Timeframe } from '@shared/models/timeframe.ts';

export async function generateProfileForAccount(accountId: string): Promise<void> {
  const robots = (await robotService.findByAccount(accountId)).filter(
    (robot) => robot.parameterSetId,
  );

  await fileService.ensureDirectory(EXPORTS_PATH);

  robots.forEach(async (robot) => {
    const expertName = expertConst.EXPERT_NAMES[robot.strategyContext.expert].replaceAll(' ', '-');

    const content = buildChrFile(robot, expertName);
    const filename = `${robot.strategyContext.symbol}-${robot.strategyContext.timeframe}-${expertName}.chr`;

    const filePath = path.join(EXPORTS_PATH, filename);
    await writeFile(filePath, content, 'utf-8');
  });
}

function buildChrFile(robot: Robot, expertName: string): string {
  const { periodType, periodSize } = getPeriodConfig(robot.strategyContext.timeframe);
  const parameters = buildParametersInFile(robot, true);

  return `<chart>
symbol=${robot.strategyContext.symbol}
period_type=${periodType}
period_size=${periodSize}
<expert>
name=REB ${expertName}
path=Experts\\REB ${expertName}.ex5
expertmode=1
<inputs>
${parameters}

</chart>
`;
}

function getPeriodConfig(timeframe: Timeframe): { periodType: number; periodSize: number } {
  if (timeframe === 'D') {
    throw new Error('Not defined for D');
  }

  const typeChar = timeframe[0]; // M or H
  const size = Number(timeframe.slice(1));

  return {
    periodType: typeChar === 'M' ? 0 : 1,
    periodSize: size,
  };
}
