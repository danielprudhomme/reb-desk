import { APP_CONFIG, EXPORTS_PATH } from '@src/config.ts';
import { fileService } from '../file.service.ts';
import { robotService } from '../robot.service.ts';
import { Robot } from '@shared/models/robot.ts';
import path from 'path';
import { writeFile } from 'fs/promises';
import { rebReportService } from '../reb-report.service.ts';
import { TimeUnit } from '@shared/models/time-unit.ts';
import expertConst from '@shared/constants/expert.constants.ts';
import { REB_EXPERT_PARAMETERS } from './reb-expert-parameters.constants.ts';

const REB_CONFIG: {
  shortTermCount: number;
  shortTermDuration: number;
  shortTermUnit: TimeUnit;
  longTermDuration: number;
  longTermUnit: TimeUnit;
  startDate: string;
} = {
  shortTermCount: 36,
  shortTermDuration: 2,
  shortTermUnit: 'month',
  longTermDuration: 6,
  longTermUnit: 'year',
  startDate: '01/05/2020',
};

const TIME_UNIT_LABELS: Record<TimeUnit, string> = {
  year: 'Années',
  month: 'Mois',
  week: 'Semaines',
  day: 'Jours',
};

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
  if (!robot.magicNumber) {
    throw new Error('Missing magic number');
  }

  const expert = robot.strategyContext.expert as 'candleSuite' | 'emaBb' | 'rsiBreak';

  const expertName = expertConst.EXPERT_NAMES[expert].replace(' ', '-');
  const expertPath = path.join(APP_CONFIG.terminalPath, `MQL5\\Experts\\REB ${expertName}.ex5`);
  const terminalPath = `${path.join(APP_CONFIG.terminalPath, 'terminal64.exe')} /portable`;

  const parameters = REB_EXPERT_PARAMETERS[expert][0];

  return `
NOM PROJET :
${projectName}
TERMINAL :
${terminalPath}
NOM EXPERT :
${expertPath}
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
EA_Magic_Number=${robot.magicNumber}||123||1||1230||N
EA_Comment=${expertName} ${robot.strategyContext.symbol} ${robot.strategyContext.timeframe}
Settings=EA Buy Settings
${parameters}
==FIN PARAMETRES OPTIMISATION==
`.trim();
}
