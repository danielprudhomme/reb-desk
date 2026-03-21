import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { RebReportService } from '../services/reb-report.service';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
import { BacktestPassAnalysis } from '@shared/models/backtest-pass-analysis';
import { BACKTEST_THRESHOLD_DISPLAY } from '../core/constants/backtest-threshold-display.constants';
import { DecimalPipe, NgClass } from '@angular/common';
import { DisplayPipe } from '../core/models/display-pipe';

@Component({
  selector: 'app-analysis',
  imports: [NgClass, DecimalPipe, MatButtonModule, MatTableModule],
  template: `
    @if (analysis) {
      <div class="h-full overflow-auto">
        <table mat-table [dataSource]="analysis">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>Pass</th>
            <td mat-cell *matCellDef="let pass">{{ pass.id }}</td>
          </ng-container>

          <ng-container matColumnDef="ok">
            <th mat-header-cell *matHeaderCellDef>Ok</th>
            <td mat-cell *matCellDef="let pass">
              <span
                class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full"
                [ngClass]="{
                  'text-emerald-700 bg-emerald-100': pass.ok,
                  'text-red-700 bg-red-100': !pass.ok,
                }"
              >
                @if (pass.ok) {
                  ✓ OK
                } @else {
                  ✕ NOK
                }
              </span>
            </td>
          </ng-container>

          @for (thresholdType of checkColumns; track thresholdType) {
            <ng-container [matColumnDef]="thresholdType">
              <th mat-header-cell *matHeaderCellDef>
                {{ $any(displayConfig)[thresholdType]?.label || thresholdType }}
              </th>

              <td mat-cell *matCellDef="let pass">
                @if (pass.checksMap[thresholdType]; as check) {
                  <div class="text-blue-300">
                    {{ formatValue(check.worstValue, $any(displayConfig)[thresholdType]?.pipe) }}
                  </div>

                  <div class="text-xs opacity-70">{{ check.rate | number: '1.0-0' }}%</div>
                }
              </td>
            </ng-container>
          }

          <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>
      </div>
    }
  `,
})
export class Analysis implements OnInit {
  private rebReportService = inject(RebReportService);
  private cdr = inject(ChangeDetectorRef);
  private reportId = inject(ActivatedRoute).snapshot.paramMap.get('reportId')!;
  analysis?: BacktestPassAnalysis[];
  displayedColumns: string[] = ['id', 'ok'];
  checkColumns: string[] = [];
  displayConfig = BACKTEST_THRESHOLD_DISPLAY;

  ngOnInit() {
    this.rebReportService.analyze(this.reportId).subscribe((analysis) => {
      this.analysis = analysis.map((pass) => ({
        ...pass,
        checksMap: Object.fromEntries(pass.checks.map((c) => [c.type, c])),
      }));

      if (analysis.length) {
        this.checkColumns = analysis[0].checks.map((c) => c.type);
        this.displayedColumns = ['id', 'ok', ...this.checkColumns];
      }

      this.cdr.detectChanges();
    });
  }

  formatValue(value: number, pipe: DisplayPipe): string {
    switch (pipe) {
      case 'percent':
        return `${value.toFixed(2)} %`;

      case 'amount':
        return `${value.toFixed(0)} €`;

      case 'ratio':
        return value.toFixed(2);

      case 'number':
      default:
        return value.toString();
    }
  }
}
