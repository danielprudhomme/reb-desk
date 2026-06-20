import { EXPORTS_PATH } from '@src/config.ts';
import { fileService } from '../file.service.ts';
import { robotService } from '../robot.service.ts';
import { REB_CONFIG, REB_EXPERTS, TIME_UNIT_LABELS } from './reb-report.constants.ts';
import { Robot } from '@shared/models/robot.ts';
import path from 'path';
import { writeFile } from 'fs/promises';
import { rebReportService } from '../reb-report.service.ts';

export async function generateRebFilesForAccount(accountId: string): Promise<void> {
  // at first do it only with non SC robots
  const robots = (await robotService.findByAccount(accountId)).filter((robot) =>
    ['candleSuite', 'emaBb', 'rsiBreak'].includes(robot.strategyContext.expert),
  );

  await fileService.ensureDirectory(EXPORTS_PATH);

  robots.forEach(async (robot) => {
    const projectName = rebReportService.generateProjectName({
      ...REB_CONFIG,
      ...robot.strategyContext,
    });

    const content = buildRebFile(robot, projectName);

    const filePath = path.join(EXPORTS_PATH, `${projectName}.reb`);
    await writeFile(filePath, content, 'utf-8');
  });
}

function buildRebFile(robot: Robot, projectName: string): string {
  const expertConfig =
    REB_EXPERTS[robot.strategyContext.expert as 'candleSuite' | 'emaBb' | 'rsiBreak'];

  return `
NOM PROJET :
${projectName}
TERMINAL :
C:\\Metatrader\\Terminaux\\Terminal 1\\terminal64.exe /portable
NOM EXPERT :
${expertConfig.path}
SYMBOLE :
${robot.strategyContext.symbol}
UNITE DE TEMPS :
${robot.strategyContext.timeframe}
SPREAD :
${robot.strategyContext.leverage}
CAPITAL :
${robot.strategyContext.capital}
DEVISE :
EUR
MODELE D'OPTIMISATION :
Prix d'ouverture uniquement
DATE DE DEBUT TESTS :
${REB_CONFIG.startDate}
NOMBRE DE COURT TERME :
${REB_CONFIG.shortTermCount}
DUREE COURT TERME :
${REB_CONFIG.shortTermDuration}
UNITE COURT TERME :
${TIME_UNIT_LABELS[REB_CONFIG.shortTermUnit]}
DUREE LONG TERME :
${REB_CONFIG.longTermDuration}
UNITE LONG TERME :
${TIME_UNIT_LABELS[REB_CONFIG.longTermUnit]}
UTILISATION SMART CHOICE :
True
UTILISATION DONNEES PASSEES :
True
==CRITERES OPTIMISATION==
::Le résultat (en %) du LT;;::Est supérieur à :;;::0;;::100;;
::Le ratio gain/chute des passages LT;;::Est supérieur à :;;::1;;::100;;
::Le résultat (en %) des passages CT;;::Est supérieur à :;;::0;;::90;;
::Le drawdown (en %) rencontré en CT;;::Est inférieur à :;;::5;;::80;;
::Le résultat (en %) du LT;;::Est inférieur à :;;::15;;::100;;
::Le drawdown (en %) rencontré en LT;;::Est inférieur à :;;::20;;::100;;
==FIN CRITERES OPTIMISATION==
==PARAMETRES OPTIMISATION==
${expertConfig.parameters}
==FIN PARAMETRES OPTIMISATION==
`.trim();
}
