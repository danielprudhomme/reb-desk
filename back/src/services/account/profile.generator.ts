import expertConst from '@shared/constants/expert.constants.ts';
import { Robot } from '@shared/models/robot.ts';
import { Timeframe } from '@shared/models/timeframe.ts';
import { EXPORTS_PATH } from '@src/config.ts';
import { writeFile } from 'fs/promises';
import path from 'path';
import { buildParametersInFile } from '../reb-report/reb-report.generator.ts';
import { fileService } from '../file.service.ts';

export const profileGenerator = {
  async generateProfile(robot: Robot): Promise<void> {
    await fileService.ensureDirectory(EXPORTS_PATH);

    const expertName = expertConst.EXPERT_NAMES[robot.strategyContext.expert].replaceAll(' ', '-');

    const { periodType, periodSize } = getPeriodConfig(robot.strategyContext.timeframe);
    const parameters = buildParametersInFile(robot, true);

    const content = `<chart>
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

    const filename = `${robot.strategyContext.symbol}-${robot.strategyContext.timeframe}-${expertName}.chr`;

    const filePath = path.join(EXPORTS_PATH, filename);
    await writeFile(filePath, content, 'utf-8');
  },
};

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
