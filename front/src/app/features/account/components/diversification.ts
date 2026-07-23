import { Component, computed, input, ChangeDetectionStrategy } from '@angular/core';
import { ExpertAdvisor } from '@shared/models/expert-advisor';
import { RobotConfiguration } from '@shared/models/robot-configuration';
import { Symbol } from '@shared/models/symbol';
import { Timeframe } from '@shared/models/timeframe';

@Component({
  selector: 'app-diversification',
  imports: [],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div class="grid grid-cols-2 gap-4">
      @for (currencyStat of currencyStats(); track currencyStat.currency) {
        <div>{{ currencyStat.currency }}</div>
        <div>{{ currencyStat.count }}</div>
      }
    </div>

    <div class="grid grid-cols-2 gap-4">
      @for (expertStat of expertStats(); track expertStat.expert) {
        <div>{{ expertStat.expert }}</div>
        <div>{{ expertStat.count }}</div>
      }
    </div>

    <div class="grid grid-cols-2 gap-4">
      @for (timeframeStat of timeframeStats(); track timeframeStat.timeframe) {
        <div>{{ timeframeStat.timeframe }}</div>
        <div>{{ timeframeStat.count }}</div>
      }
    </div>
  `,
})
export class Diversification {
  robots = input.required<RobotConfiguration[]>();
  stats = computed(() => {
    const stats = createStats();
    this.robots().forEach((r) => registerRobot(stats, r));
    return stats;
  });

  currencyStats = computed(() => {
    return Array.from(this.stats().currencyCount.entries()).map(([currency, count]) => ({
      currency,
      count,
    }));
  });

  expertStats = computed(() => {
    return Array.from(this.stats().expertCount.entries()).map(([expert, count]) => ({
      expert,
      count,
    }));
  });

  timeframeStats = computed(() => {
    return Array.from(this.stats().timeframeCount.entries()).map(([timeframe, count]) => ({
      timeframe,
      count,
    }));
  });
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

function extractCurrencies(symbol: Symbol): [string, string] {
  return [symbol.slice(0, 3), symbol.slice(3, 6)];
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

function createKey(...parts: (string | number)[]): string {
  return parts.join('|');
}
