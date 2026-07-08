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

    const { name: expertName, ex5Name } = expertConst.EXPERT_CONSTANTS[robot.expert];

    const { periodType, periodSize } = getPeriodConfig(robot.timeframe);
    const parameters = buildParametersInFile(robot, true);

    const content = `<chart>
symbol=${robot.symbol}
period_type=${periodType}
period_size=${periodSize}
<expert>
name=${ex5Name}
path=Experts\\${ex5Name}.ex5
expertmode=1
<inputs>
${parameters}

</chart>
`;

    const filename = `${robot.symbol}-${robot.timeframe}-${expertName.replaceAll(' ', '-')}.chr`;

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
