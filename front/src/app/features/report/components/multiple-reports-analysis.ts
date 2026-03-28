import { Component, effect, inject, signal } from '@angular/core';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RebReportService } from '../../../services/reb-report.service';
import { firstValueFrom, map } from 'rxjs';

@Component({
  selector: 'app-multiple-report-analysis',
  imports: [MatInputModule, MatFormFieldModule, MatButtonModule, FormField, FormRoot],
  template: `
    <form [formRoot]="form" class="flex items-center gap-4">
      <mat-form-field class="w-100">
        <mat-label>Symbol</mat-label>
        <input matInput [formField]="form.symbol" />
      </mat-form-field>

      <mat-form-field class="w-100">
        <mat-label>Timeframe</mat-label>
        <input matInput [formField]="form.timeframe" />
      </mat-form-field>

      <button matButton="filled" type="submit">Run analysis</button>
    </form>
  `,
})
export class MultipleReportsAnalysis {
  private rebReportService = inject(RebReportService);
  model = signal({ symbol: 'AUDCAD', timeframe: 'H1' });
  form = form(this.model, {
    submission: {
      action: async () =>
        await firstValueFrom(
          this.rebReportService.analyze(this.model()).pipe(map((r) => this.result.set(r))),
        ),
    },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result = signal<any>(undefined);

  constructor() {
    effect(() => {
      console.log(this.result());
    });
  }
}
