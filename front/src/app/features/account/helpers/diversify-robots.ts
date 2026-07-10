import { ExpertAdvisor } from '@shared/models/expert-advisor';
import { Timeframe } from '@shared/models/timeframe';
import { Symbol } from '@shared/models/symbol';
import { RobotConfiguration } from '@shared/models/robot-configuration';

export type ExpertDistribution = Partial<Record<ExpertAdvisor, number>>;

function extractCurrencies(symbol: Symbol): [string, string] {
  return [symbol.slice(0, 3), symbol.slice(3, 6)];
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

  const increment = <K>(map: Map<K, number>, key: K, value = 1): void => {
    map.set(key, (map.get(key) ?? 0) + value);
  };

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

function computeScore(stats: DiversificationStats, candidate: RobotConfiguration): number {
  const [base, quote] = extractCurrencies(candidate.symbol);

  const expertSymbolKey = createKey(candidate.expert, candidate.symbol);
  const expertTimeframeKey = createKey(candidate.expert, candidate.timeframe);
  const symbolTimeframeKey = createKey(candidate.symbol, candidate.timeframe);
  const comboBaseKey = createKey(candidate.expert, candidate.timeframe, base);
  const comboQuoteKey = createKey(candidate.expert, candidate.timeframe, quote);

  return (
    get(stats.expertCount, candidate.expert) * 10 +
    get(stats.timeframeCount, candidate.timeframe) * 8 +
    get(stats.symbolCount, candidate.symbol) * 6 +
    get(stats.currencyCount, base) * 5 +
    get(stats.currencyCount, quote) * 5 +
    get(stats.expertSymbolCount, expertSymbolKey) * 20 +
    get(stats.expertTimeframeCount, expertTimeframeKey) * 30 +
    get(stats.symbolTimeframeCount, symbolTimeframeKey) * 15 +
    get(stats.comboCount, comboBaseKey) * 50 +
    get(stats.comboCount, comboQuoteKey) * 50
  );
}

function buildExpertTargets(
  existingRobots: RobotConfiguration[],
  distribution: ExpertDistribution,
): Map<ExpertAdvisor, number> {
  const targets = new Map<ExpertAdvisor, number>();

  // nombre exact demandé
  for (const [expert, count] of Object.entries(distribution)) {
    targets.set(expert as ExpertAdvisor, count);
  }

  // on retire les robots déjà présents sur le compte
  for (const robot of existingRobots) {
    const remaining = targets.get(robot.expert);

    if (remaining !== undefined && remaining > 0) {
      targets.set(robot.expert, remaining - 1);
    }
  }

  return targets;
}

export function diversifyRobots(
  currentAccountRobots: RobotConfiguration[],
  allAccountsRobots: RobotConfiguration[],
  timeframes: Timeframe[],
  symbols: Symbol[],
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

  const selected: RobotConfiguration[] = [...currentAccountRobots];
  const newRobots: RobotConfiguration[] = [];
  const localStats = createStats();
  currentAccountRobots.forEach((r) => registerRobot(localStats, r));

  const globalStats = createStats();
  allAccountsRobots.forEach((r) => registerRobot(globalStats, r));

  const expertTargets = buildExpertTargets(currentAccountRobots, distribution);
  const targetRobotCount = Object.values(distribution).reduce(
    (sum, count) => sum + (count ?? 0),
    0,
  );

  while (selected.length < targetRobotCount) {
    let bestIndex = -1;
    let bestScore = Number.POSITIVE_INFINITY;

    // On pourrait faire plusieurs tours (si par exemple le check sur symbolTimeframeKey est toujours faux)
    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];

      if ((expertTargets.get(candidate.expert) ?? 0) <= 0) {
        continue;
      }

      const symbolTimeframeKey = createKey(candidate.symbol, candidate.timeframe);
      if (get(localStats.symbolTimeframeCount, symbolTimeframeKey) >= 1) {
        continue;
      }

      const localScore = computeScore(localStats, candidate);
      const globalScore = computeScore(globalStats, candidate);
      const score = localScore * 5 + globalScore;

      if (score < bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }

    const chosen = candidates[bestIndex];

    selected.push(chosen);
    newRobots.push(chosen);

    registerRobot(localStats, chosen);
    registerRobot(globalStats, chosen);

    // consume expert quota
    expertTargets.set(chosen.expert, (expertTargets.get(chosen.expert) ?? 1) - 1);
  }

  return newRobots;
}
