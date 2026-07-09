import { ExpertAdvisor } from '@shared/models/expert-advisor';
import { Timeframe } from '@shared/models/timeframe';
import { Symbol } from '@shared/models/symbol';
import { RobotConfiguration } from '@shared/models/robot-configuration';

export type ExpertDistribution = Partial<Record<ExpertAdvisor, number>>;

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

function buildExpertTargets(
  numberOfRobots: number,
  existingRobots: RobotConfiguration[],
  distribution: ExpertDistribution,
): Map<ExpertAdvisor, number> {
  const targets = new Map<ExpertAdvisor, number>();

  let allocated = 0;

  for (const [expert, percent] of Object.entries(distribution)) {
    const count = Math.floor((numberOfRobots * percent) / 100);
    targets.set(expert as ExpertAdvisor, count);
    allocated += count;
  }

  // distribute remaining robots caused by rounding
  const remaining = numberOfRobots - allocated;

  const experts = Object.keys(distribution) as ExpertAdvisor[];

  for (let i = 0; i < remaining; i++) {
    const expert = experts[i % experts.length];
    targets.set(expert, (targets.get(expert) ?? 0) + 1);
  }

  // remove already existing robots from quota
  for (const robot of existingRobots) {
    const current = targets.get(robot.expert);

    if (current !== undefined && current > 0) {
      targets.set(robot.expert, current - 1);
    }
  }

  return targets;
}

export function diversifyRobots(
  existingRobots: RobotConfiguration[],
  timeframes: Timeframe[],
  symbols: Symbol[],
  numberOfRobots: number,
  distribution: ExpertDistribution,
): RobotConfiguration[] {
  const candidates: RobotConfiguration[] = [];

  const experts = Object.entries(distribution)
    .filter(([, percentage]) => percentage > 0)
    .map(([expert]) => expert as ExpertAdvisor);

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

  candidates.sort(() => Math.random() - 0.5);

  const selected: RobotConfiguration[] = [...existingRobots];

  const newRobots: RobotConfiguration[] = [];

  const stats = createStats();

  for (const robot of existingRobots) {
    registerRobot(stats, robot);
  }

  const expertTargets = buildExpertTargets(numberOfRobots, existingRobots, distribution);

  while (selected.length < numberOfRobots) {
    let bestIndex = -1;
    let bestScore = Number.POSITIVE_INFINITY;

    for (let level = 1; level <= 3 && bestIndex === -1; level++) {
      for (let i = 0; i < candidates.length; i++) {
        const candidate = candidates[i];

        // Expert quota reached
        if ((expertTargets.get(candidate.expert) ?? 0) <= 0) {
          continue;
        }

        const [base, quote] = extractCurrencies(candidate.symbol);

        const expertSymbolKey = createKey(candidate.expert, candidate.symbol);

        const exactKey = createKey(candidate.expert, candidate.timeframe, candidate.symbol);

        // avoid same expert + symbol first
        if (level === 1 && get(stats.expertSymbolCount, expertSymbolKey) >= 1) {
          continue;
        }

        // avoid exact duplicate
        if (
          level === 2 &&
          selected.some((r) => createKey(r.expert, r.timeframe, r.symbol) === exactKey)
        ) {
          continue;
        }

        const score =
          get(stats.expertCount, candidate.expert) * 10 +
          get(stats.timeframeCount, candidate.timeframe) * 8 +
          get(stats.symbolCount, candidate.symbol) * 6 +
          get(stats.currencyCount, base) * 5 +
          get(stats.currencyCount, quote) * 5 +
          get(stats.expertTimeframeCount, createKey(candidate.expert, candidate.timeframe)) * 30 +
          get(stats.symbolTimeframeCount, createKey(candidate.symbol, candidate.timeframe)) * 15 +
          get(stats.comboCount, createKey(candidate.expert, candidate.timeframe, base)) * 50 +
          get(stats.comboCount, createKey(candidate.expert, candidate.timeframe, quote)) * 50;

        if (score < bestScore) {
          bestScore = score;
          bestIndex = i;
        }
      }
    }

    // fallback if everything is saturated
    if (bestIndex === -1) {
      candidates.push(...selected);
      continue;
    }

    const chosen = candidates[bestIndex];

    selected.push(chosen);
    newRobots.push(chosen);

    registerRobot(stats, chosen);

    // consume expert quota
    expertTargets.set(chosen.expert, (expertTargets.get(chosen.expert) ?? 1) - 1);
  }

  return newRobots;
}
