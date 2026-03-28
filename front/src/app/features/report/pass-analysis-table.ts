import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { BacktestPassAnalysis } from '@shared/models/backtest-pass-analysis';
import { BACKTEST_THRESHOLD_DISPLAY } from '../../core/constants/backtest-threshold-display.constants';
import { DecimalPipe, NgClass } from '@angular/common';
import { DisplayPipe } from '../../core/models/display-pipe';
import { BacktestPassParameter } from '@shared/models/backtest-pass-parameter';
import { BacktestThresholdCheck } from '@shared/models/backtest-threshold-check';

type BacktestPassAnalysisWithAdditionalMaps = BacktestPassAnalysis & {
  checksMap: { [k: string]: BacktestThresholdCheck };
  parametersMap: { [k: string]: BacktestPassParameter };
};

@Component({
  selector: 'app-pass-analysis-table',
  imports: [NgClass, DecimalPipe, MatButtonModule, MatTableModule, MatTooltipModule, MatSortModule],
  template: `
    <div class="h-full overflow-auto">
      <table
        mat-table
        [dataSource]="dataSource"
        matSort
        matSortActive="score"
        matSortDirection="desc"
        matSortDisableClear
      >
        <ng-container matColumnDef="id" [sticky]="true">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Number</th>
          <td mat-cell *matCellDef="let pass">{{ pass.id }}</td>
        </ng-container>

        <ng-container matColumnDef="score" [sticky]="true">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Score</th>
          <td mat-cell *matCellDef="let pass">
            <span
              class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full"
              [ngClass]="{
                'bg-emerald-100 text-emerald-700': pass.score >= 0.75,
                'bg-yellow-100 text-yellow-700': pass.score >= 0.4 && pass.score < 0.75,
                'bg-red-100 text-red-700': pass.score < 0.4,
              }"
            >
              {{ pass.score * 100 | number: '1.2-2' }}%
            </span>
          </td>
        </ng-container>

        @for (thresholdType of checkColumns; track thresholdType) {
          <ng-container [matColumnDef]="thresholdType">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>
              <span class="whitespace-nowrap block w-30">
                {{ $any(displayConfig)[thresholdType]?.label || thresholdType }}
              </span>
            </th>

            <td mat-cell *matCellDef="let pass">
              @if (pass.checksMap[thresholdType]; as check) {
                <div [class.text-green-300]="check.ok" [class.text-red-300]="!check.ok">
                  <div>
                    {{ formatValue(check.worstValue, $any(displayConfig)[thresholdType]?.pipe) }}
                  </div>

                  <div class="text-xs opacity-70">
                    {{ check.rate | number: '1.0-0' }}% /
                    {{ check.requiredRate | number: '1.0-0' }}%
                  </div>
                </div>
              }
            </td>
          </ng-container>
        }

        <!-- @for (paramName of parameterColumns; track paramName) {
          <ng-container [matColumnDef]="paramName">
            <th
              mat-header-cell
              *matHeaderCellDef
              mat-sort-header
              class="max-w-[100px] truncate"
              [matTooltip]="paramName"
            >
              {{ paramName }}
            </th>

            <td mat-cell *matCellDef="let pass">
              {{ pass.parametersMap[paramName]?.value }}
            </td>
          </ng-container>
        } -->

        <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
      </table>
    </div>
  `,
})
export class PassAnalysisTable implements AfterViewInit {
  analysis = input.required<BacktestPassAnalysis[]>();
  private sort = viewChild.required(MatSort);
  private cdr = inject(ChangeDetectorRef);
  private reportId = inject(ActivatedRoute).snapshot.paramMap.get('reportId')!;
  dataSource: MatTableDataSource<BacktestPassAnalysisWithAdditionalMaps> =
    new MatTableDataSource<BacktestPassAnalysisWithAdditionalMaps>([]);
  displayedColumns: string[] = [];
  checkColumns: string[] = [];
  parameterColumns: string[] = [];
  displayConfig = BACKTEST_THRESHOLD_DISPLAY;

  ngAfterViewInit() {
    const analysis = this.analysis();
    const analysisWithAdditionalMaps = analysis.map((pass) => ({
      ...pass,
      checksMap: Object.fromEntries(pass.checks.map((c) => [c.type, c])),
      parametersMap: Object.fromEntries(pass.parameters.map((p) => [p.name, p])),
    }));

    this.dataSource = new MatTableDataSource(analysisWithAdditionalMaps);

    this.dataSource.sortingDataAccessor = (item, property) => {
      if (property === 'id') return item.id;
      if (property === 'score') return item.score;
      if (property === 'ok') return item.ok ? 1 : 0;
      if (item.parametersMap?.[property]) return item.parametersMap[property].value;

      if (item.checksMap?.[property]) {
        const check = item.checksMap[property];
        return check.type.includes('longTerm')
          ? check.worstValue
          : check.ok
            ? 1000 + check.rate
            : check.rate;
      }

      return 0;
    };

    if (analysis.length) {
      const firstPass = analysis[0];
      // this.parameterColumns = firstPass.parameters.filter((p) => !p.fixed).map((p) => p.name);
      this.checkColumns = firstPass.checks.map((c) => c.type);
      // this.displayedColumns = ['id', 'score', ...this.checkColumns, ...this.parameterColumns];
      this.displayedColumns = ['id', 'score', ...this.checkColumns];
    }

    this.cdr.detectChanges();

    setTimeout(() => {
      this.dataSource.sort = this.sort();
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

  sliceMiddle(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;

    const startLength = Math.ceil(maxLength / 2) - 1;
    const endLength = Math.floor(maxLength / 2) - 1;

    return str.slice(0, startLength) + '…' + str.slice(str.length - endLength);
  }
}
