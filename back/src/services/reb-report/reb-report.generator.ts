import { Robot } from '@shared/models/robot.ts';
import expertConst from '@shared/constants/expert.constants.ts';
import { Parameter } from '@shared/models/parameter.ts';
import { ExpertParameterName } from '@shared/models/expert-parameter-name.ts';
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
  async createRebReport(robot: Robot, capital: number, leverage: number): Promise<void> {
    await fileService.ensureDirectory(EXPORTS_PATH);
    const projectName = this.generateProjectName({
      ...REB_CONFIG,
      ...robot,
      capital,
      leverage,
    });

    const content = buildRebFile(robot, capital, leverage, projectName);

    const filePath = path.join(EXPORTS_PATH, `${projectName}.reb`);
    await writeFile(filePath, content, 'utf-8');
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
): string {
  if (!robot.magicNumber) {
    throw new Error('Missing magic number');
  }

  const expert = robot.expert;

  const ex5Name = expertConst.EXPERT_CONSTANTS[expert].ex5Name;
  const expertPath = path.join(APP_CONFIG.terminalPath, `MQL5\\Experts\\${ex5Name}.ex5`);
  const terminalPath = `${path.join(APP_CONFIG.terminalPath, 'terminal64.exe')} /portable`;

  const parameters = buildParametersInFile(robot, false);

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
${parameters}
==FIN PARAMETRES OPTIMISATION==
`.trim();
}

export function buildParametersInFile(robot: Robot, applyParams: boolean): string {
  const expert = robot.expert;

  const expertName = expertConst.EXPERT_CONSTANTS[expert].name;
  const parametersOfExpert = expertParameters[expert][0];

  const baseParameters = expertParametersToString(BASE_PARAMETERS);

  const base = `EA_Magic_Number=${robot.magicNumber}||123||1||1230||N
EA_Comment=${robot.symbol} ${robot.timeframe} ${expertName}
${parametersOfExpert}
${baseParameters}
${otherParameters}`;

  return applyParams && robot.parameterSet
    ? applyParameters(base, robot.parameterSet.parameters)
    : base;
}

function applyParameters(template: string, params: Parameter[]) {
  const map = new Map(params.map((p) => [p.name, p.value]));

  return template
    .split('\n')
    .map((line) => {
      const eqIndex = line.indexOf('=');
      if (eqIndex === -1) return line;

      const name = line.slice(0, eqIndex);
      const rest = line.slice(eqIndex + 1);

      if (!map.has(name as ExpertParameterName)) {
        return line;
      }

      const value = map.get(name as ExpertParameterName);

      const parts = rest.split('||');

      // replace ONLY first value
      parts[0] = String(value);

      return `${name}=${parts.join('||')}`;
    })
    .join('\n');
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
Force_Non_Trading_If_Nothing_Word=NONTRADE
`;

const expertParameters: Record<ExpertAdvisor, string[]> = {
  candleSuite: [
    `Suite=4||4||1||6||Y
Extreme_Research=50||100||200||500||Y`,
  ],

  emaBb: [
    `EMA_Slow_Period=200||50||0||200||N
BB_Period=20||20||0||100||Y
BB_Deviation=1||2||1||3||Y
BB_Way=1||0||0||1||Y`,
  ],

  rsiBreak: [
    `Extreme_Research=500||50||250||500||Y
RSI_Period=14||14||1||140||N
RSI_Start=30||30||20||50||Y
Delta_RSI_Buy=20||20||20||40||Y`,
  ],

  ichimoku: [''],

  strategyCreator: [
    `Engulfing_Candle_Score=1||0.0||0.000000||0.000000||N
BB_Period=200||50||50||200||Y
BB_Deviation=2||2||1||3||Y
Under_Lower_BB_Score=1||0.0||0.000000||0.000000||N
Min_Buy_Score=2||1.0||0.100000||10.000000||N`,
    `Tenkan_Sen=9||9||1||90||N
Kijun_Sen=26||26||1||260||N
Senkou_Span_B=52||52||1||520||N
Ichi_Cloud_Pos_Score=1||0.0||0.000000||0.000000||N
SAR_Step=0.02||0.01||0.01||0.03||Y
SAR_Max=0.2||0.1||0.1||0.3||Y
SAR_Score=0||0.0||0.000000||0.000000||N
SAR_Change_Score=1||0.0||0.000000||0.000000||N
Min_Buy_Score=2||1.0||0.100000||10.000000||N`,
    `RSI_Period=42||14||28||42||Y
RSI_Min_Level=40||40||10||60||Y
RSI_Min_Score=1||0.0||0.000000||0.000000||N
BB_Period=20||20||30||50||Y
BB_Deviation=1.5||2||1||3||Y
Above_Lower_BB_Change_Score=1||0.0||0.000000||0.000000||N
Min_Buy_Score=2||1.0||0.100000||10.000000||N`,
    `MA_Slow_Period=200||100||100||200||N
MA_Fast_Period=50||20||30||50||N
MA_Method=1||0||0||3||N
MA_Score=0||0.0||0.000000||0.000000||N
MA_Change_Score=0||0.0||0.000000||0.000000||N
MA_Trend_Period=200||50||150||200||Y
MA_Trend_Method=1||0||0||3||N
MA_Trend_TF=0||0||0||49153||N
MA_Trend_Score=1||0.0||0.000000||0.000000||N
RSI_Period=14||7||7||14||Y
RSI_TF=0||0||0||49153||N
RSI_Min_Level=70||30||1||300||N
RSI_Min_Score=0||0.0||0.000000||0.000000||N
RSI_Min_Change_Score=0||0.0||0.000000||0.000000||N
RSI_Max_Level=30||30||10||60||Y
RSI_Max_Score=0||0.0||0.000000||0.000000||N
RSI_Max_Change_Score=1||0.0||0.000000||0.000000||N
Min_Buy_Score=2||1.0||0.100000||10.000000||N`,
    `MA_Slow_Period=200||100||100||200||Y
MA_Fast_Period=50||20||30||50||Y
MA_Method=1||0||0||3||N
MA_Score=1||0.0||0.000000||0.000000||N
MACD_Fast=12||12||1||120||N
MACD_Slow=26||26||1||260||N
MACD_Signal=26||26||1||260||N
MACD_Way_Score=0||0.0||0.000000||0.000000||N
MACD_Way_Change_Score=1||0.0||0.000000||0.000000||N
MACD_Min_Level=0||0.0||0.000000||0.000000||N
MACD_Min_Level_Score=0||0.0||0.000000||0.000000||N
MACD_Max_Level=0||0.0||0.000000||0.000000||N
MACD_Max_Level_Score=1||0.0||0.000000||0.000000||N
Min_Buy_Score=3||1.0||0.100000||10.000000||N`,
    `RSI_Period=14||14||14||42||N
RSI_Min_Level=30||40||10||60||N
RSI_Min_Score=0||0.0||0.000000||0.000000||N
RSI_Min_Change_Score=0||0.0||0.000000||0.000000||N
RSI_Max_Level=30||20||10||50||Y
RSI_Max_Score=1||0.0||0.000000||0.000000||N
Engulfing_Candle_Score=1||0.0||0.000000||0.000000||N
Min_Buy_Score=2||1.0||0.100000||10.000000||N`,
    `MA_Slow_Period=200||100||100||200||N
MA_Fast_Period=50||20||30||50||N
MA_Method=1||0||0||3||N
MA_Score=0||0.0||0.000000||0.000000||N
MA_Change_Score=0||0.0||0.000000||0.000000||N
MA_Trend_Period=50||50||50||200||Y
MA_Trend_Method=1||0||0||3||N
MA_Trend_Score=1||0.0||0.000000||0.000000||N
SAR_Step=0.02||0.01||0.01||0.02||Y
SAR_Max=0.1||0.1||0.1||0.2||Y
SAR_Change_Score=1||0.0||0.000000||0.000000||N
Min_Buy_Score=2||1.0||0.100000||10.000000||N`,
    `RSI_Period=28||14||14||42||Y
RSI_Min_Level=30||40||10||60||N
RSI_Min_Score=0||0.0||0.000000||0.000000||N
RSI_Min_Change_Score=0||0.0||0.000000||0.000000||N
RSI_Max_Level=60||60||10||90||Y
RSI_Max_Score=0||0.0||0.000000||0.000000||N
RSI_Max_Change_Score=1||0.0||0.000000||0.000000||N
Min_Buy_Score=1||1.0||0.100000||10.000000||N`,
    `Stoch_K_Period=25||5||10||25||Y
Stoch_D_Period=3||3||5||12||Y
Stoch_Slowing=3||3||1||30||N
Stoch_Average_Methode=0||0||0||3||N
Stoch_TF=0||0||0||49153||N
Stoch_Way_Score=0||0.0||0.000000||0.000000||N
Stoch_Way_Change_Score=1||0.0||0.000000||0.000000||N
Stoch_Min_Level=20||20||1||200||N
Stoch_Min_Level_Score=0||0.0||0.000000||0.000000||N
Stoch_Max_Level=20||80||1||800||N
Stoch_Max_Level_Score=1||0.0||0.000000||0.000000||N
Min_Buy_Score=2||1.0||0.100000||10.000000||N`,
  ],

  autoBot: [''],
};

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
