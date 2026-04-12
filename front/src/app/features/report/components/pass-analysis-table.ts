import { Component, computed, inject, input, resource, viewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { BACKTEST_THRESHOLD_DISPLAY } from '../constants/backtest-threshold-display.constants';
import { DecimalPipe, NgClass } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ReportFilter } from '@shared/models/report-filter';
import { RebReportService } from '@app/services/reb-report.service';
import { firstValueFrom } from 'rxjs';
import { PassAnalysisLongTermSummaryCell } from './pass-analysis-long-term-summary-cell';
import { BacktestLongTermSummary } from '../models/backtest-long-term-summary';
import { FormatPipe } from '@app/shared/pipes/format.pipe';
import { EXPERT_NAMES } from '@shared/constants/expert.constants';
import { BACKTEST_THRESHOLD_VALUE_TYPE } from '@shared/constants/backtest-threshold-value-type';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-pass-analysis-table',
  imports: [
    NgClass,
    DecimalPipe,
    MatTableModule,
    MatSortModule,
    ScrollingModule,
    PassAnalysisLongTermSummaryCell,
    FormatPipe,
    MatTooltip,
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
        <td mat-cell *matCellDef="let pass">{{ pass.expertName }}</td>
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

      <ng-container matColumnDef="longTermSummary">
        <th mat-header-cell *matHeaderCellDef mat-sort-header>Summary</th>

        <td mat-cell *matCellDef="let pass">
          <app-pass-analysis-long-term-summary-cell [longTermSummary]="pass.longTermSummary" />
        </td>
      </ng-container>

      @for (thresholdType of checkColumns(); track thresholdType) {
        <ng-container [matColumnDef]="thresholdType">
          @let label = $any(displayConfig)[thresholdType]?.label || thresholdType;

          <th mat-header-cell *matHeaderCellDef mat-sort-header>
            <span class="whitespace-nowrap block w-30">{{ label }}</span>
          </th>

          <td mat-cell *matCellDef="let pass">
            @if (pass.checksMap[thresholdType]; as check) {
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
                    {{ check.averageValue | format: displayPipe }}
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
    </table>
  `,
})
export class PassAnalysisTable {
  filter = input.required<ReportFilter>();
  private rebReportService = inject(RebReportService);
  private sort = viewChild.required(MatSort);
  analysisResource = resource({
    loader: async () => firstValueFrom(this.rebReportService.analyze(this.filter())),
  });
  dataSource = computed(() => {
    const analysis = this.analysisResource.value();
    if (!analysis) return new MatTableDataSource([]);

    const analysisWithAdditionalMaps = analysis.map((pass) => ({
      ...pass,
      expertName: EXPERT_NAMES[pass.expert],
      checksMap: Object.fromEntries(pass.checks.map((c) => [c.type, c])),
      // parametersMap: Object.fromEntries(pass.parameters.map((p) => [p.name, p])),
      longTermSummary: new BacktestLongTermSummary(pass),
    }));

    const dataSource = new MatTableDataSource(analysisWithAdditionalMaps);

    dataSource.sortingDataAccessor = (item, property) => {
      if (property === 'score') return item.score;
      if (property === 'ok') return item.ok ? 1 : 0;
      if (property === 'longTermSummary') return item.longTermSummary.averageMonthlyPerformance;
      // if (item.parametersMap?.[property]) return item.parametersMap[property].value;

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

    dataSource.sort = this.sort();

    return dataSource;
  });
  checkColumns = computed(() => {
    const analysis = this.analysisResource.value();
    if (!analysis) return [];
    const firstPass = analysis[0];
    return firstPass.checks.map((c) => c.type);
  });
  displayedColumns = computed(() => [
    'expert',
    'symbol',
    'timeframe',
    'score',
    'longTermSummary',
    ...this.checkColumns(),
  ]);
  displayConfig = BACKTEST_THRESHOLD_DISPLAY;
  thresholdValueType = BACKTEST_THRESHOLD_VALUE_TYPE;
}
