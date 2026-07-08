import { ExpertAdvisor } from '@shared/models/expert-advisor.ts';
import { Symbol } from '@shared/models/symbol.ts';
import { Timeframe } from '@shared/models/timeframe.ts';
import { db } from '@src/db/database.ts';

// Forex symbols : 3 digits
export const SYMBOL_CODE: Record<Symbol, string> = {
  AUDCAD: '102',
  AUDCHF: '108',
  AUDJPY: '105',
  AUDNZD: '106',
  AUDUSD: '103',
  CADCHF: '208',
  CADJPY: '205',
  CHFJPY: '805',
  EURAUD: '401',
  EURCAD: '402',
  EURCHF: '408',
  EURGBP: '407',
  EURJPY: '405',
  EURNZD: '406',
  EURUSD: '403',
  GBPAUD: '701',
  GBPCAD: '702',
  GBPCHF: '708',
  GBPJPY: '705',
  GBPNZD: '706',
  GBPUSD: '703',
  NZDCAD: '602',
  NZDCHF: '608',
  NZDJPY: '605',
  NZDUSD: '603',
  USDCAD: '302',
  USDCHF: '308',
  USDJPY: '305',
  XAUUSD: '903',
} as const;

// Timeframes : 2 digits
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

// Expert Advisors : 2 digits
export const EA_CODE: Record<ExpertAdvisor, string> = {
  candleSuite: '01',
  rsiBreak: '02',
  emaBb: '03',
  autoBot: '04',
  ichimoku: '05',

  scBbEngulfing: '10',
  scIchiSar: '11',
  scRsiBb: '12',
  scEmaRsi: '13',
  scEmaMacd: '14',
  scRsiEngulfing: '15',
  scEmaSar: '16',
  scRsiOnly: '17',
  scStochOnly: '18',
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

// Unique number 10 digits: 1 digit for type, 3 digits for symbol, 2 digits for timeframe, 2 digits for EA, 2 digits for index
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
