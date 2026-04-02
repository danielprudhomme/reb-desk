import { Component, input } from '@angular/core';
import { DecimalPipe, NgClass, PercentPipe } from '@angular/common';
import { BacktestLongTermSummary } from '../models/backtest-long-term-summary';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-pass-analysis-long-term-summary-cell',
  imports: [NgClass, DecimalPipe, PercentPipe, MatTooltipModule],
  template: `
    @let summary = longTermSummary();
    <div class="flex flex-col items-center gap-1 text-sm">
      <div class="flex items-baseline justify-center gap-2">
        <span
          class="text-lg font-bold"
          [ngClass]="{
            'text-green-600': summary.averageMonthlyPerformance > 0,
            'text-red-600': summary.averageMonthlyPerformance < 0,
          }"
          matTooltip="Average monthly performance"
        >
          {{ summary.averageMonthlyPerformance | percent: '1.2-2' }}
        </span>

        <span class="text-xs text-gray-500">/month</span>

        <span class="text-sm text-gray-400" matTooltip="Average LT result">
          {{ summary.averageResult | number: '1.2-2' }} €
        </span>
      </div>

      <div class="flex justify-center gap-2 text-xs">
        <span class="text-red-500" matTooltip="Worst LT DD amount">
          {{ summary.worstDrawdownAmount | number: '1.2-2' }} €
        </span>
        <span class="text-red-400" matTooltip="Worst LT DD percent">
          {{ summary.worstDrawdownPercent / 100 | percent: '1.2-2' }}
        </span>
      </div>

      <div class="text-xs text-gray-400" matTooltip="Average LT Ratio Gain/Loss">
        {{ summary.averageRewardRatio | number: '1.2-2' }}
        <span class="ml-1">€ / DD</span>
      </div>
    </div>
  `,
})
export class PassAnalysisLongTermSummaryCell {
  longTermSummary = input.required<BacktestLongTermSummary>();
}
