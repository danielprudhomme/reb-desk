import { Component, computed, inject, input, resource, viewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { BACKTEST_THRESHOLD_DISPLAY } from '../constants/backtest-threshold-display.constants';
import { DecimalPipe, NgClass, PercentPipe } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ReportFilter } from '@shared/models/report-filter';
import { RebReportService } from 'src/app/services/reb-report.service';
import { firstValueFrom } from 'rxjs';
import { PassAnalysisLongTermSummaryCell } from './pass-analysis-long-term-summary-cell';
import { BacktestLongTermSummary } from '../models/backtest-long-term-summary';
import { FormatPipe } from 'src/app/shared/pipes/format.pipe';
import { EXPERT_NAMES } from '@shared/constants/expert.constants';

@Component({
  selector: 'app-pass-analysis-table',
  imports: [
    NgClass,
    DecimalPipe,
    PercentPipe,
    MatTableModule,
    MatSortModule,
    ScrollingModule,
    PassAnalysisLongTermSummaryCell,
    FormatPipe,
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
              'bg-emerald-100 text-emerald-700': pass.score >= 0.75,
              'bg-yellow-100 text-yellow-700': pass.score >= 0.4 && pass.score < 0.75,
              'bg-red-100 text-red-700': pass.score < 0.4,
            }"
          >
            {{ pass.score | percent: '1.2-2' }}
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
          <th mat-header-cell *matHeaderCellDef mat-sort-header>
            <span class="whitespace-nowrap block w-30">
              {{ $any(displayConfig)[thresholdType]?.label || thresholdType }}
            </span>
          </th>

          <td mat-cell *matCellDef="let pass">
            @if (pass.checksMap[thresholdType]; as check) {
              <div [class.text-green-300]="check.ok" [class.text-red-300]="!check.ok">
                <div>
                  {{ check.worstValue | format: $any(displayConfig)[thresholdType]?.pipe }}
                </div>

                <div class="text-xs opacity-70">
                  {{ check.rate | number: '1.0-0' }}% / {{ check.requiredRate | number: '1.0-0' }}%
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
      parametersMap: Object.fromEntries(pass.parameters.map((p) => [p.name, p])),
      longTermSummary: new BacktestLongTermSummary(pass),
    }));

    const dataSource = new MatTableDataSource(analysisWithAdditionalMaps);

    dataSource.sortingDataAccessor = (item, property) => {
      if (property === 'id') return item.id;
      if (property === 'score') return item.score;
      if (property === 'ok') return item.ok ? 1 : 0;
      if (property === 'longTermSummary') return item.longTermSummary.averageMonthlyPerformance;
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
}
