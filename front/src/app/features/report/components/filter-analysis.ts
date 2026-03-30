import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PassAnalysisTable } from './pass-analysis-table';

@Component({
  selector: 'app-filter-analysis',
  imports: [MatInputModule, MatFormFieldModule, MatButtonModule, FormField, PassAnalysisTable],
  template: `
    <div class="h-full w-full flex flex-col">
      <div class="flex items-center gap-4">
        <mat-form-field class="w-100">
          <mat-label>Symbol</mat-label>
          <input matInput [formField]="form.symbol" />
        </mat-form-field>

        <mat-form-field class="w-100">
          <mat-label>Timeframe</mat-label>
          <input matInput [formField]="form.timeframe" />
        </mat-form-field>

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
  model = signal({ symbol: 'AUDCAD', timeframe: 'H1' });
  run = signal(false);
  form = form(this.model);

  runAnalysis() {
    this.run.set(true);
  }
}
