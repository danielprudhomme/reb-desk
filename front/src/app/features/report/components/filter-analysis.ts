import { Component, inject, resource, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RebReportService } from '../../../services/reb-report.service';
import { firstValueFrom } from 'rxjs';
import { PassAnalysisTable } from './pass-analysis-table';

@Component({
  selector: 'app-filter-analysis',
  imports: [MatInputModule, MatFormFieldModule, MatButtonModule, FormField, PassAnalysisTable],
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

      @if (analysisResource.isLoading()) {
        Analysis loading...
      }

      @if (analysisResource.value(); as analysis) {
        <app-pass-analysis-table class="flex-1" [analysis]="analysis" />
      }
    </div>
  `,
})
export class FilterAnalysis {
  private rebReportService = inject(RebReportService);
  private model = signal({ symbol: 'AUDCAD', timeframe: 'H1' });
  private runTrigger = signal(0);
  form = form(this.model);

  analysisResource = resource({
    params: () => this.runTrigger(),
    loader: async ({ params }) => {
      return params === 0 ? undefined : firstValueFrom(this.rebReportService.analyze(this.model()));
    },
  });

  runAnalysis() {
    this.runTrigger.update((v) => v + 1);
  }
}
