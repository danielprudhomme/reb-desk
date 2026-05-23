import { ExpertAdvisor } from '@shared/models/expert-advisor';
import { Timeframe } from '@shared/models/timeframe';
import { Symbol } from '@shared/models/symbol';
import { RobotConfiguration } from '@shared/models/robot-configuration';

function extractCurrencies(symbol: Symbol): [string, string] {
  return [symbol.slice(0, 3), symbol.slice(3, 6)];
}

function increment<K>(map: Map<K, number>, key: K, value = 1): void {
  map.set(key, (map.get(key) ?? 0) + value);
}

function get<K>(map: Map<K, number>, key: K): number {
  return map.get(key) ?? 0;
}

function createKey(...parts: (string | number)[]): string {
  return parts.join('|');
}

interface DiversificationStats {
  expertCount: Map<ExpertAdvisor, number>;
  timeframeCount: Map<Timeframe, number>;
  symbolCount: Map<Symbol, number>;
  currencyCount: Map<string, number>;

  expertSymbolCount: Map<string, number>;
  expertTimeframeCount: Map<string, number>;
  symbolTimeframeCount: Map<string, number>;

  comboCount: Map<string, number>;
}

function createStats(): DiversificationStats {
  return {
    expertCount: new Map(),
    timeframeCount: new Map(),
    symbolCount: new Map(),
    currencyCount: new Map(),

    expertSymbolCount: new Map(),
    expertTimeframeCount: new Map(),
    symbolTimeframeCount: new Map(),

    comboCount: new Map(),
  };
}

function registerRobot(stats: DiversificationStats, robot: RobotConfiguration): void {
  const [base, quote] = extractCurrencies(robot.symbol);

  increment(stats.expertCount, robot.expert);
  increment(stats.timeframeCount, robot.timeframe);
  increment(stats.symbolCount, robot.symbol);

  increment(stats.currencyCount, base);
  increment(stats.currencyCount, quote);

  increment(stats.expertSymbolCount, createKey(robot.expert, robot.symbol));

  increment(stats.expertTimeframeCount, createKey(robot.expert, robot.timeframe));

  increment(stats.symbolTimeframeCount, createKey(robot.symbol, robot.timeframe));

  increment(stats.comboCount, createKey(robot.expert, robot.timeframe, base));

  increment(stats.comboCount, createKey(robot.expert, robot.timeframe, quote));
}

export function diversifyRobots(
  existingRobots: RobotConfiguration[],
  experts: ExpertAdvisor[],
  timeframes: Timeframe[],
  symbols: Symbol[],
  maxRobots: number,
): RobotConfiguration[] {
  const candidates: RobotConfiguration[] = [];

  for (const expert of experts) {
    for (const timeframe of timeframes) {
      for (const symbol of symbols) {
        candidates.push({
          expert,
          timeframe,
          symbol,
        });
      }
    }
  }

  // Shuffle
  candidates.sort(() => Math.random() - 0.5);

  const selected = [
    ...existingRobots.map((r) => ({ expert: r.expert, timeframe: r.timeframe, symbol: r.symbol })),
  ];
  const stats = createStats();

  // Initialize with existing robots
  for (const robot of existingRobots) {
    registerRobot(stats, robot);
  }

  while (selected.length < maxRobots && candidates.length > 0) {
    let bestIndex = -1;
    let bestScore = Number.POSITIVE_INFINITY;

    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];

      const [base, quote] = extractCurrencies(candidate.symbol);

      const expertSymbolKey = createKey(candidate.expert, candidate.symbol);

      // Hard constraint
      if (get(stats.expertSymbolCount, expertSymbolKey) >= 1) {
        continue;
      }

      const score =
        // Global balancing
        get(stats.expertCount, candidate.expert) * 10 +
        get(stats.timeframeCount, candidate.timeframe) * 8 +
        get(stats.symbolCount, candidate.symbol) * 6 +
        // Currency exposure
        get(stats.currencyCount, base) * 5 +
        get(stats.currencyCount, quote) * 5 +
        // Diversification penalties
        get(stats.expertTimeframeCount, createKey(candidate.expert, candidate.timeframe)) * 30 +
        get(stats.symbolTimeframeCount, createKey(candidate.symbol, candidate.timeframe)) * 15 +
        get(stats.comboCount, createKey(candidate.expert, candidate.timeframe, base)) * 50 +
        get(stats.comboCount, createKey(candidate.expert, candidate.timeframe, quote)) * 50;

      if (score < bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }

    if (bestIndex === -1) {
      break;
    }

    const chosen = candidates.splice(bestIndex, 1)[0];

    selected.push(chosen);

    registerRobot(stats, chosen);
  }

  return selected;
}
