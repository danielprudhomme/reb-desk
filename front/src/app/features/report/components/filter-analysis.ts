import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReportFilter } from '@shared/models/report-filter';
import { FilterForm } from './filter-form';
import { PassAnalysisTable } from './pass-analysis-table';

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
          <app-pass-analysis-table [filter]="model()" />
        }
      </div>
    </div>
  `,
})
export class FilterAnalysis {
  model = signal<ReportFilter>({
    symbols: ['AUDCAD'],
    timeframes: ['H1'],
    experts: ['candleSuite'],
  });
  run = signal(false);
  form = form(this.model);

  runAnalysis() {
    this.run.set(true);
  }
}
