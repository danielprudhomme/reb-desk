import { Component, computed, inject, signal } from '@angular/core';
import { symbols } from '@shared/models/symbol';
import { diversifyRobots } from '../helpers/diversify-robots';
import { DiversificationTable } from './diversification-table';
import { Robot } from '@app/core/models/robot';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-account-details',
  imports: [DiversificationTable],
  template: `
    <div>Account ID : {{ id() }}</div>
    <div>Robots : {{ robots().length }}</div>

    <div class="h-full overflow-auto">
      <app-diversification-table [robots]="robots()" />
    </div>
  `,
})
export class AccountDetails {
  private route = inject(ActivatedRoute);
  id = computed(() => this.route.snapshot.paramMap.get('id'));
  isCreate = computed(() => !this.id());
  isEdit = computed(() => !!this.id());
  robots = signal<Robot[]>([]);

  constructor() {
    const selectedSymbols = symbols.filter((s) => !s.includes('XAU'));

    const robots = diversifyRobots({
      experts: ['candleSuite', 'emaBb', 'rsiBreak', 'strategyCreator'],
      timeframes: ['M15', 'M20', 'M30', 'H1'],
      symbols: selectedSymbols,
      maxRobots: 99,
    });

    this.robots.set(robots);
  }
}
