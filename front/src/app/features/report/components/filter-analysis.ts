import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FilterAnalysisResult } from './filter-analysis-result';

@Component({
  selector: 'app-filter-analysis',
  imports: [MatInputModule, MatFormFieldModule, MatButtonModule, FormField, FilterAnalysisResult],
  template: `
    <div class="h-full w-full">
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

      @if (run()) {
        <app-filter-analysis-result [filter]="model()" />
      } @else {
        enter filter...
      }
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
