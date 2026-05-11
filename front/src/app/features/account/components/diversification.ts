import { Component, signal } from '@angular/core';
import { symbols } from '@shared/models/symbol';
import { Robot } from '@shared/models/robot';
import { diversifyRobots } from '../helpers/diversify-robots';
import { DiversificationTable } from './diversification-table';

@Component({
  selector: 'app-diversification',
  imports: [DiversificationTable],
  template: ` <app-diversification-table [robots]="robots()" /> `,
})
export class Diversification {
  robots = signal<Robot[]>([]);

  constructor() {
    const selectedSymbols = symbols.filter((s) => !s.includes('JPY'));

    const robots = diversifyRobots({
      experts: ['candleSuite', 'emaBb', 'rsiBreak', 'autoBot', 'strategyCreator'],
      timeframes: ['M12', 'M15', 'M20', 'M30', 'H1'],
      symbols: selectedSymbols,
      maxRobots: 99,
    });

    this.robots.set(robots);
  }
}
