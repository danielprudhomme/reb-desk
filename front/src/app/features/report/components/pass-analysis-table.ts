import { Component, computed, inject, input, resource, viewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { BACKTEST_THRESHOLD_DISPLAY } from '../constants/backtest-threshold-display.constants';
import { DecimalPipe, NgClass } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { AnalysisRequest } from '@shared/models/analysis-request';
import { RebReportService } from '@app/services/reb-report.service';
import { firstValueFrom } from 'rxjs';
import { PassAnalysisLongTermSummaryCell } from './pass-analysis-long-term-summary-cell';
import { BacktestLongTermSummary } from '../models/backtest-long-term-summary';
import { FormatPipe } from '@app/shared/pipes/format.pipe';
import { BACKTEST_THRESHOLD_VALUE_TYPE } from '@shared/constants/backtest-threshold-value-type';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ExpertAdvisor } from '@shared/models/expert-advisor';
import { TimeUnit } from '@shared/models/time-unit';
import { GroupedBacktestPassAnalysis } from '@shared/models/backtest-pass-analysis';
import { ExpertBadge } from '@app/shared/components/expert-badge';
import { Symbol } from '@shared/models/symbol';
import { Timeframe } from '@shared/models/timeframe';

interface TableItem extends GroupedBacktestPassAnalysis {
  expert: ExpertAdvisor;
  symbol: Symbol;
  timeframe: Timeframe;
  capital: number;
  startDate: string;
  shortTermCount: number;
  shortTermDuration: number;
  shortTermUnit: TimeUnit;
  longTermDuration: number;
  longTermUnit: TimeUnit;
  longTermSummary: BacktestLongTermSummary;
}

@Component({
  selector: 'app-pass-analysis-table',
  imports: [
    NgClass,
    DecimalPipe,
    MatTableModule,
    MatSortModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    ScrollingModule,
    PassAnalysisLongTermSummaryCell,
    FormatPipe,
    ExpertBadge,
  ],
  template: `
    <table
      mat-table
      [dataSource]="dataSource()"
      matSort
      matSortActive="score"
      matSortDirection="desc"
      matSortDisableClear
    >
      <ng-container matColumnDef="expert" [sticky]="true">
        <th mat-header-cell *matHeaderCellDef>Expert</th>
        <td mat-cell *matCellDef="let pass">
          <app-expert-badge [expert]="pass.expert" />
        </td>
      </ng-container>

      <ng-container matColumnDef="symbol" [sticky]="true">
        <th mat-header-cell *matHeaderCellDef mat-sort-header>Symbol</th>
        <td mat-cell *matCellDef="let pass">{{ pass.symbol }}</td>
      </ng-container>

      <ng-container matColumnDef="timeframe" [sticky]="true">
        <th mat-header-cell *matHeaderCellDef mat-sort-header>TF</th>
        <td mat-cell *matCellDef="let pass">{{ pass.timeframe }}</td>
      </ng-container>

      <ng-container matColumnDef="score" [sticky]="true">
        <th mat-header-cell *matHeaderCellDef mat-sort-header>Score</th>
        <td mat-cell *matCellDef="let pass">
          <span
            class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full"
            [ngClass]="{
              'bg-emerald-100 text-emerald-700': pass.score >= 0.7,
              'bg-yellow-100 text-yellow-700': pass.score >= 0.5 && pass.score < 0.7,
              'bg-red-100 text-red-700': pass.score < 0.5,
            }"
          >
            {{ pass.score * 100 | number: '1.2-2' }}
          </span>
        </td>
      </ng-container>

      <ng-container matColumnDef="longTermSummary" [sticky]="true">
        <th mat-header-cell *matHeaderCellDef mat-sort-header>Summary</th>

        <td mat-cell *matCellDef="let pass">
          <app-pass-analysis-long-term-summary-cell [longTermSummary]="pass.longTermSummary" />
        </td>
      </ng-container>

      @for (threshold of thresholds(); let index = $index; track threshold.columnName) {
        <ng-container [matColumnDef]="threshold.columnName">
          @let thresholdType = threshold.type;
          @let label = $any(displayConfig)[thresholdType]?.label || thresholdType;

          <th mat-header-cell *matHeaderCellDef mat-sort-header>
            <span class="whitespace-nowrap block w-30">{{ label }}</span>
          </th>

          <td mat-cell *matCellDef="let pass">
            @if (pass.checks[index]; as check) {
              <div
                class="flex flex-col gap-1"
                [class.text-green-300]="check.score >= 0.5"
                [class.text-yellow-300]="check.score > 0 && check.score < 0.5"
                [class.text-red-300]="check.score === 0"
              >
                @let displayPipe = $any(displayConfig)[thresholdType]?.pipe;

                @if (thresholdValueType[thresholdType] === 'rate') {
                  <div class="font-medium">
                    {{ check.rate | number: '1.0-0' }}% /
                    {{ check.requiredRate | number: '1.0-0' }}%
                  </div>
                } @else {
                  <div class="font-medium">
                    {{ check.worstValue | format: displayPipe }}
                  </div>
                }

                <div class="text-xs opacity-70 flex gap-4">
                  <span class="whitespace-nowrap" [matTooltip]="'Worst ' + label">
                    {{ check.worstValue | format: displayPipe }}
                  </span>

                  <span class="whitespace-nowrap" [matTooltip]="'Average ' + label">
                    {{ check.averageValue | format: displayPipe }}
                  </span>

                  <span class="whitespace-nowrap" [matTooltip]="'Best ' + label">
                    {{ check.bestValue | format: displayPipe }}
                  </span>
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

      <tr mat-header-row *matHeaderRowDef="displayedColumns(); sticky: true"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns()"></tr>
      <tr class="mat-row" *matNoDataRow>
        <td
          class="mat-cell text-center py-10 opacity-60"
          [attr.colspan]="displayedColumns().length"
        >
          @if (analysisResource.isLoading()) {
            <div class="flex items-center justify-start gap-2">
              <mat-spinner diameter="20"></mat-spinner>
              Loading report...
            </div>
          } @else {
            No report found
          }
        </td>
      </tr>
    </table>
  `,
})
export class PassAnalysisTable {
  config = input<{ showRobotConfiguration: boolean }>({ showRobotConfiguration: true });
  request = input.required<AnalysisRequest>();
  private rebReportService = inject(RebReportService);
  private sort = viewChild.required(MatSort);
  displayConfig = BACKTEST_THRESHOLD_DISPLAY;
  thresholdValueType = BACKTEST_THRESHOLD_VALUE_TYPE;
  analysisResource = resource({
    loader: async () => firstValueFrom(this.rebReportService.analyze(this.request())),
  });
  thresholds = computed(() =>
    this.request().thresholds.map((threshold, index) => ({
      ...threshold,
      columnName: `check-${index}`,
      valueType: BACKTEST_THRESHOLD_VALUE_TYPE[threshold.type],
    })),
  );
  displayedColumns = computed(() => {
    const columns = ['score', 'longTermSummary', ...this.thresholds().map((t) => t.columnName)];
    return this.config().showRobotConfiguration
      ? ['expert', 'symbol', 'timeframe', ...columns]
      : columns;
  });
  dataSource = computed(() => {
    const groupedReports = this.analysisResource.value();
    if (!groupedReports) return new MatTableDataSource([]);

    const analysisWithAdditionalMaps: TableItem[] = groupedReports.flatMap((group) =>
      group.passes.map((pass) => ({
        ...group,
        ...pass,
        longTermSummary: new BacktestLongTermSummary(
          pass.longTermResults,
          group.capital,
          group.longTermUnit,
          group.longTermDuration,
        ),
      })),
    );

    const dataSource = new MatTableDataSource(analysisWithAdditionalMaps);

    dataSource.sortingDataAccessor = (item, property) => {
      if (property === 'score') return item.score;
      if (property === 'ok') return item.ok ? 1 : 0;
      if (property === 'longTermSummary') return item.longTermSummary.averageMonthlyPerformance;

      const checkIndex = this.thresholds().findIndex((t) => t.columnName === property);
      const check = item.checks[checkIndex];
      if (check) {
        return this.thresholds()[checkIndex].valueType === 'value'
          ? check.worstValue
          : check.ok
            ? 1000 + check.rate
            : check.rate;
      }

      return 0;
    };

    dataSource.sort = this.sort();

    return dataSource;
  });
}
