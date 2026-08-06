import { Robot } from '@shared/models/robot.ts';
import expertConst from '@shared/constants/expert.constants.ts';
import { APP_CONFIG, EXPORTS_PATH } from '@src/config.ts';
import { fileService } from '../file.service.ts';
import { ExpertAdvisor } from '@shared/models/expert-advisor.ts';
import { Timeframe } from '@shared/models/timeframe.ts';
import { TimeUnit } from '@shared/models/time-unit.ts';
import { Symbol } from '@shared/models/symbol.ts';
import path from 'path';
import { writeFile } from 'fs/promises';
import { ExpertParameterConfig } from '@src/models/expert-parameter-config.ts';
import { BASE_PARAMETERS } from './base-parameters.ts';
import { EXPERT_PARAMETERS } from './expert-parameters.ts';

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

export const rebReportGenerator = {
  async createEmptyRebReports(robot: Robot, capital: number, leverage: number): Promise<void> {
    await fileService.ensureDirectory(EXPORTS_PATH);

    const parametersArray = EXPERT_PARAMETERS[robot.expert];

    parametersArray.forEach(async (parameters, index) => {
      let projectName = this.generateProjectName({ ...REB_CONFIG, ...robot, capital, leverage });
      if (index > 0) {
        projectName += `-${index + 1}`;
      }

      parameters = [...parameters, ...BASE_PARAMETERS];

      const content = buildRebFile(robot, capital, leverage, projectName, parameters);

      const filePath = path.join(EXPORTS_PATH, `${projectName}.reb`);
      await writeFile(filePath, content, 'utf-8');
    });
  },
  generateProjectName(params: {
    expert: ExpertAdvisor;
    symbol: Symbol;
    timeframe: Timeframe;
    capital: number;
    leverage: number;
    startDate: string;
    shortTermCount: number;
    shortTermDuration: number;
    shortTermUnit: TimeUnit;
    longTermDuration: number;
    longTermUnit: TimeUnit;
  }): string {
    const expertName = expertConst.EXPERT_CONSTANTS[params.expert].name.replaceAll(' ', '');
    const startDate = normalizeDate({ date: params.startDate });
    const shortTerm = `${params.shortTermCount}x${params.shortTermDuration}${params.shortTermUnit.toString()[0]}`;
    const longTerm = `${params.longTermDuration}${params.longTermUnit.toString()[0]}`;
    const currentDate = normalizeDate({ precise: true });
    return `${params.symbol}-${params.timeframe}-${expertName}-${params.capital}-${params.leverage}-${startDate}-${shortTerm}-${longTerm}-${currentDate}`;
  },
};

function buildRebFile(
  robot: Robot,
  capital: number,
  leverage: number,
  projectName: string,
  parameters: ExpertParameterConfig[],
): string {
  if (!robot.magicNumber) {
    throw new Error('Missing magic number');
  }

  const ex5Name = expertConst.EXPERT_CONSTANTS[robot.expert].ex5Name;
  const expertPath = path.join(APP_CONFIG.terminalPath, `MQL5\\Experts\\${ex5Name}.ex5`);
  const terminalPath = `${path.join(APP_CONFIG.terminalPath, 'terminal64.exe')} /portable`;

  return `NOM PROJET :
${projectName}
TERMINAL :
${terminalPath}
NOM EXPERT :
${expertPath}
SYMBOLE :
${robot.symbol}
UNITE DE TEMPS :
${robot.timeframe}
SPREAD :
${leverage}
CAPITAL :
${capital}
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
${buildParametersInFile(robot, parameters)}
==FIN PARAMETRES OPTIMISATION==
`.trim();
}

export function buildParametersInFile(robot: Robot, parameters: ExpertParameterConfig[]): string {
  const expertName = expertConst.EXPERT_CONSTANTS[robot.expert].name;

  return `EA_Magic_Number=${robot.magicNumber}||123||1||1230||N
EA_Comment=${robot.symbol} ${robot.timeframe} ${expertName}
${expertParametersToString(parameters)}
${otherParameters}`;
}

function expertParametersToString(parameters: ExpertParameterConfig[]): string {
  return parameters
    .map((parameter) => {
      const value = parameter.value;
      const min = parameter.min ?? '0';
      const step = parameter.step ?? '0';
      const max = parameter.max ?? '0';
      const variable = parameter.variable ? 'Y' : 'N';

      return `${parameter.name}=${value}||${min}||${step}||${max}||${variable}`;
    })
    .join('\n');
}

const otherParameters = `Stop_Before_News_In_Min=5||5||1||50||N
Start_After_News_In_Min=5||5||1||50||N
Low_News_Filter=false||false||0||true||N
Medium_News_Filter=false||false||0||true||N
High_News_Filter=true||false||0||true||N
GMT_Zone=3||3||1||30||N
NewsSymb=USD,EUR,GBP,CHF,CAD,AUD,NZD,JPY
Stop_Trading_If_News=false||false||0||true||N
Close_All_Orders_If_News=false||false||0||true||N
ATR_Max_Research=200||200||1||2000||N
Pause_On_High_Volatity_In_Candles=0||0||1||10||N
Force_Buy_Word=
Force_Sell_Word=
Force_Pause_Word=PAUSE
Force_Non_Trading_If_Nothing_Word=NONTRADE`;

function normalizeDate(params: { date?: string; precise?: boolean }): string {
  const now = new Date();
  const { date, precise } = params;

  if (precise) {
    const pad = (value: number, length = 2) => value.toString().padStart(length, '0');

    return (
      pad(now.getDate()) +
      pad(now.getMonth() + 1) +
      pad(now.getFullYear() % 100) +
      pad(now.getHours()) +
      pad(now.getMinutes()) +
      pad(now.getSeconds()) +
      pad(now.getMilliseconds(), 3)
    );
  }

  const input = date ?? now.toLocaleDateString('fr-FR'); // ex: 19/06/2026
  const digitsOnly = input.replace(/\D/g, '');

  return (
    digitsOnly.substring(0, 2) + // day
    digitsOnly.substring(2, 4) + // month
    digitsOnly.substring(6, 8) // year (last 2 digits)
  );
}
