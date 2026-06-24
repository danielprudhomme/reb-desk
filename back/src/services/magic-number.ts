import { ExpertAdvisor } from '@shared/models/expert-advisor.ts';
import { Symbol } from '@shared/models/symbol.ts';
import { Timeframe } from '@shared/models/timeframe.ts';
import { db } from '@src/db/database.ts';

export const SYMBOL_CODE: Record<Symbol, string> = {
  AUDCAD: '0102',
  AUDCHF: '0108',
  AUDJPY: '0105',
  AUDNZD: '0106',
  AUDUSD: '0103',
  CADCHF: '0208',
  CADJPY: '0205',
  CHFJPY: '0805',
  EURAUD: '0401',
  EURCAD: '0402',
  EURCHF: '0408',
  EURGBP: '0407',
  EURJPY: '0405',
  EURNZD: '0406',
  EURUSD: '0403',
  GBPAUD: '0701',
  GBPCAD: '0702',
  GBPCHF: '0708',
  GBPJPY: '0705',
  GBPNZD: '0706',
  GBPUSD: '0703',
  NZDCAD: '0602',
  NZDCHF: '0608',
  NZDJPY: '0605',
  NZDUSD: '0603',
  USDCAD: '0302',
  USDCHF: '0308',
  USDJPY: '0305',
  XAUUSD: '0903',
} as const;

export const TIMEFRAME_CODE: Record<Timeframe, string> = {
  M1: '01',
  M2: '02',
  M3: '03',
  M4: '04',
  M5: '05',
  M6: '06',
  M10: '07',
  M12: '08',
  M15: '09',
  M20: '10',
  M30: '11',
  H1: '12',
  H2: '13',
  H3: '14',
  H4: '15',
  H6: '16',
  H8: '17',
  H12: '18',
  D: '19',
} as const;

export const EA_CODE: Record<ExpertAdvisor, string> = {
  candleSuite: '1',
  rsiBreak: '2',
  emaBb: '3',
  strategyCreator: '4',
  autoBot: '5',
  ichimoku: '6',
} as const;

const TYPE_FOREX = '1';

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

function getNextRobotIndex(existing: number[]): number {
  let candidate = 0;

  const sorted = [...existing].sort((a, b) => a - b);

  for (const value of sorted) {
    if (value === candidate) {
      candidate += 10;
    } else if (value > candidate) {
      break;
    }
  }

  if (candidate > 90) {
    throw new Error('Maximum number of robots reached for this configuration');
  }

  return candidate;
}

export async function generateMagicNumber(params: {
  accountId: string;
  symbol: Symbol;
  timeframe: Timeframe;
  expert: ExpertAdvisor;
}): Promise<string> {
  const { accountId, symbol, timeframe, expert } = params;

  const symbolCode = SYMBOL_CODE[symbol];
  const timeframeCode = TIMEFRAME_CODE[timeframe];
  const eaCode = EA_CODE[expert];

  if (!symbolCode || !timeframeCode || !eaCode) {
    throw new Error('Invalid symbol/timeframe/EA configuration');
  }

  const prefix = TYPE_FOREX + symbolCode + timeframeCode + eaCode;

  const existingRobots = await db.query.robotsTable.findMany({
    where: (robot, { and, eq, like }) =>
      and(eq(robot.accountId, accountId), like(robot.magicNumber, `${prefix}%`)),
  });

  const usedIndexes = existingRobots
    .map((r) => Number(r.magicNumber!.slice(8)))
    .filter((n) => !isNaN(n));

  const nextIndex = getNextRobotIndex(usedIndexes);

  return `${prefix}${pad2(nextIndex)}`;
}
