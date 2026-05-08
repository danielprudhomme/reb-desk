import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FilterForm } from './filter-form';
import { PassAnalysisTable } from './pass-analysis-table';
import { AnalysisRequest } from '@shared/models/analysis-request';

@Component({
  selector: 'app-filter-analysis',
  imports: [
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    FormField,
    PassAnalysisTable,
    FilterForm,
  ],
  template: `
    <div class="h-full w-full flex flex-col">
      <div class="flex items-center gap-4">
        <app-filter-form [formField]="form" />

        <button matButton="filled" (click)="runAnalysis()">Run analysis</button>
      </div>

      <div class="flex-1 min-h-0 overflow-auto">
        @if (run()) {
          <app-pass-analysis-table [request]="model()" />
        }
      </div>
    </div>
  `,
})
export class FilterAnalysis {
  model = signal<AnalysisRequest>({
    symbols: ['AUDUSD'],
    timeframes: ['H1'],
    experts: ['candleSuite'],
    thresholds: [
      {
        type: 'longTermResultPercent',
        operator: '>',
        value: 0,
        passRate: 100,
        weight: 3,
      },
      {
        type: 'shortTermResultPercent',
        operator: '>',
        value: 0,
        passRate: 80,
        weight: 1,
      },
      {
        type: 'longTermGainLossRatio',
        operator: '>',
        value: 1,
        passRate: 100,
        weight: 3,
      },
      {
        type: 'shortTermTrades',
        operator: '>',
        value: 1,
        passRate: 100,
        weight: 0.5,
      },
      {
        type: 'shortTermDrawdownPercent',
        operator: '<',
        value: 15,
        passRate: 80,
        weight: 1,
      },
      {
        type: 'shortTermDrawdownPercent',
        operator: '<',
        value: 30,
        passRate: 100,
        weight: 1,
      },
      {
        type: 'longTermDrawdownAmount',
        operator: '<',
        value: 400,
        passRate: 100,
        weight: 1,
      },
    ],
  });
  run = signal(false);
  form = form(this.model);

  runAnalysis() {
    this.run.set(true);
  }
}
