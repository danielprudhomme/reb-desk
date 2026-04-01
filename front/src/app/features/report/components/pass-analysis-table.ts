import { Component, computed, inject, input, resource, viewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { BACKTEST_THRESHOLD_DISPLAY } from '../constants/backtest-threshold-display.constants';
import { DecimalPipe, NgClass, PercentPipe } from '@angular/common';
import { DisplayPipe } from '../../../core/models/display-pipe';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ReportFilter } from '@shared/models/report-filter';
import { RebReportService } from 'src/app/services/reb-report.service';
import { firstValueFrom } from 'rxjs';
import { BacktestPassAnalysis } from '@shared/models/backtest-pass-analysis';

interface BacktestLongTermSummary {
  averageResult: number;
  averageMonthlyPerformance: number;
  worstDrawdownAmount: number;
  worstDrawdownPercent: number;
  averageRewardRatio: number;
}

@Component({
  selector: 'app-pass-analysis-table',
  imports: [NgClass, DecimalPipe, PercentPipe, MatTableModule, MatSortModule, ScrollingModule],
  template: `
    <table
      mat-table
      [dataSource]="dataSource()"
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
            {{ pass.score | percent: '1.2-2' }}
          </span>
        </td>
      </ng-container>

      <ng-container matColumnDef="summary">
        <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-center">Summary</th>

        <td mat-cell *matCellDef="let pass" class="text-center">
          <div class="flex flex-col items-center gap-1 text-sm">
            <div class="flex items-baseline justify-center gap-2">
              <span
                class="text-lg font-bold"
                [ngClass]="{
                  'text-green-600': pass.summary.averageMonthlyPerformance > 0,
                  'text-red-600': pass.summary.averageMonthlyPerformance < 0,
                }"
              >
                {{ pass.summary.averageMonthlyPerformance | percent: '1.2-2' }}
              </span>

              <span class="text-xs text-gray-500">/month</span>

              <span class="text-sm text-gray-400">
                {{ pass.summary.averageResult | number: '1.2-2' }} €
              </span>
            </div>

            <div class="flex justify-center gap-2 text-xs">
              <span class="text-red-500">
                {{ pass.summary.worstDrawdownAmount | number: '1.2-2' }} €
              </span>
              <span class="text-red-400">
                {{ pass.summary.worstDrawdownPercent / 100 | percent: '1.2-2' }}
              </span>
            </div>

            <div class="text-xs text-gray-400">
              {{ pass.summary.averageRewardRatio | number: '1.2-2' }}
              <span class="ml-1">€ / DD</span>
            </div>
          </div>
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
                  {{ formatValue(check.worstValue, $any(displayConfig)[thresholdType]?.pipe) }}
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
      checksMap: Object.fromEntries(pass.checks.map((c) => [c.type, c])),
      parametersMap: Object.fromEntries(pass.parameters.map((p) => [p.name, p])),
      summary: this.getSummary(pass),
    }));

    const dataSource = new MatTableDataSource(analysisWithAdditionalMaps);

    dataSource.sortingDataAccessor = (item, property) => {
      if (property === 'id') return item.id;
      if (property === 'score') return item.score;
      if (property === 'ok') return item.ok ? 1 : 0;
      if (property === 'summary') return item.summary.averageMonthlyPerformance;
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
  displayedColumns = computed(() => ['id', 'score', 'summary', ...this.checkColumns()]);
  displayConfig = BACKTEST_THRESHOLD_DISPLAY;

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

  getSummary(pass: BacktestPassAnalysis): BacktestLongTermSummary {
    if (pass.longTermUnit !== 'year') {
      throw new Error('Calculation not yet implemented. Only YEAR.');
    }

    const results = pass.longTermResults;
    const avg = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;

    console.log(
      results.map((r) => r.drawdownPercent),
      Math.max(...results.map((r) => r.drawdownPercent)),
    );

    return {
      averageResult: avg(results.map((r) => r.result)),
      averageMonthlyPerformance: avg(
        results.map((r) => r.result / pass.capital / pass.longTermDuration / 12),
      ),
      worstDrawdownAmount: Math.max(...results.map((r) => r.drawdownAmount)),
      worstDrawdownPercent: Math.max(...results.map((r) => r.drawdownPercent)),
      averageRewardRatio: avg(results.map((r) => r.result / r.drawdownAmount)),
    };
  }
}
