import { ExpertAdvisor } from '@shared/models/expert-advisor';
import { Timeframe } from '@shared/models/timeframe';
import { Symbol } from '@shared/models/symbol';
import { Robot } from '@app/core/models/robot';

interface DiversificationInput {
  accountId: string;
  experts: ExpertAdvisor[];
  timeframes: Timeframe[];
  symbols: Symbol[];
  maxRobots?: number;
}

function extractCurrencies(symbol: Symbol): [string, string] {
  return [symbol.slice(0, 3), symbol.slice(3, 6)];
}

function increment<K>(map: Map<K, number>, key: K, value = 1) {
  map.set(key, (map.get(key) ?? 0) + value);
}

function get<K>(map: Map<K, number>, key: K): number {
  return map.get(key) ?? 0;
}

export function diversifyRobots({
  accountId,
  experts,
  timeframes,
  symbols,
  maxRobots = 99,
}: DiversificationInput): Robot[] {
  const allCandidates: Robot[] = [];

  // Génération de toutes les combinaisons
  for (const expert of experts) {
    for (const timeframe of timeframes) {
      for (const symbol of symbols) {
        allCandidates.push({
          id: '',
          accountId,
          status: 'inProgress',
          expert,
          timeframe,
          symbol,
          parameters: [],
        });
      }
    }
  }

  // Shuffle léger pour éviter les biais fixes
  allCandidates.sort(() => Math.random() - 0.5);

  const selected: Robot[] = [];

  // Stats globales
  const expertCount = new Map<ExpertAdvisor, number>();
  const timeframeCount = new Map<Timeframe, number>();
  const symbolCount = new Map<Symbol, number>();
  const currencyCount = new Map<string, number>();

  // Stats de diversification avancées
  const expertSymbolCount = new Map<string, number>();
  const expertTimeframeCount = new Map<string, number>();
  const symbolTimeframeCount = new Map<string, number>();

  // expert + timeframe + currency
  const comboCount = new Map<string, number>();

  while (selected.length < maxRobots && allCandidates.length > 0) {
    let bestIndex = -1;
    let bestScore = Number.POSITIVE_INFINITY;

    for (let i = 0; i < allCandidates.length; i++) {
      const candidate = allCandidates[i];

      const [base, quote] = extractCurrencies(candidate.symbol);

      // HARD CONSTRAINT
      // Évite d'avoir plusieurs fois le même expert
      // sur le même symbol si possible
      const sameExpertSymbol =
        get(expertSymbolCount, `${candidate.expert}|${candidate.symbol}`) >= 1;

      if (sameExpertSymbol) {
        continue;
      }

      const score =
        // équilibrage global experts
        get(expertCount, candidate.expert) * 10 +
        // équilibrage global timeframe
        get(timeframeCount, candidate.timeframe) * 8 +
        // équilibrage global symbol
        get(symbolCount, candidate.symbol) * 6 +
        // équilibrage currencies
        get(currencyCount, base) * 5 +
        get(currencyCount, quote) * 5 +
        // forte pénalité :
        // même expert sur même symbol
        get(expertSymbolCount, `${candidate.expert}|${candidate.symbol}`) * 100 +
        // pénalité :
        // même expert sur même timeframe
        get(expertTimeframeCount, `${candidate.expert}|${candidate.timeframe}`) * 30 +
        // pénalité :
        // même symbol sur même timeframe
        get(symbolTimeframeCount, `${candidate.symbol}|${candidate.timeframe}`) * 15 +
        // très forte pénalité :
        // même expert + timeframe + currency
        get(comboCount, `${candidate.expert}|${candidate.timeframe}|${base}`) * 50 +
        get(comboCount, `${candidate.expert}|${candidate.timeframe}|${quote}`) * 50;

      if (score < bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }

    // Aucun candidat valide restant
    if (bestIndex === -1) {
      break;
    }

    const chosen = allCandidates.splice(bestIndex, 1)[0];

    selected.push(chosen);

    const [base, quote] = extractCurrencies(chosen.symbol);

    // Stats globales
    increment(expertCount, chosen.expert);
    increment(timeframeCount, chosen.timeframe);
    increment(symbolCount, chosen.symbol);

    increment(currencyCount, base);
    increment(currencyCount, quote);

    // Diversification locale
    increment(expertSymbolCount, `${chosen.expert}|${chosen.symbol}`);

    increment(expertTimeframeCount, `${chosen.expert}|${chosen.timeframe}`);

    increment(symbolTimeframeCount, `${chosen.symbol}|${chosen.timeframe}`);

    // combo expert + tf + currency
    increment(comboCount, `${chosen.expert}|${chosen.timeframe}|${base}`);

    increment(comboCount, `${chosen.expert}|${chosen.timeframe}|${quote}`);
  }

  return selected;
}
