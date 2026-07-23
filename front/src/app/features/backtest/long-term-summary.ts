import { Component, computed, input, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe, NgClass, PercentPipe } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Backtest } from '@shared/models/backtest';

@Component({
  selector: 'app-long-term-summary',
  imports: [NgClass, DecimalPipe, PercentPipe, MatTooltipModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div class="flex flex-col gap-1 text-sm">
      <div class="flex items-baseline gap-2">
        @let avgMonthlyPerformance = averageMonthlyPerformance();
        <span
          class="text-lg font-bold"
          [ngClass]="{
            'text-green-600': avgMonthlyPerformance > 0,
            'text-red-600': avgMonthlyPerformance < 0,
          }"
          matTooltip="Average monthly performance"
        >
          {{ avgMonthlyPerformance | percent: '1.2-2' }}
        </span>

        <span class="text-xs text-gray-500">/month</span>

        <span class="text-sm text-gray-400" matTooltip="Average LT result">
          {{ averageResult() | number: '1.0-0' }} €
        </span>
      </div>

      <div class="flex gap-2 text-xs">
        <span class="text-red-500" matTooltip="Worst LT DD amount">
          {{ worstDrawdownAmount() | number: '1.0-0' }} €
        </span>
        <span class="text-red-400" matTooltip="Worst LT DD percent">
          {{ worstDrawdownPercent() / 100 | percent: '1.2-2' }}
        </span>
        <span class="text-gray-400" matTooltip="Average LT Ratio Gain/Loss">
          {{ averageRewardRatio() | number: '1.2-2' }}€ / DD
        </span>
      </div>
    </div>
  `,
})
export class LongTermSummary {
  backtest = input.required<Backtest>();
  averageResult = computed(() => avg(this.backtest().longTermResults.map((r) => r.result)));
  averageMonthlyPerformance = computed(() =>
    avg(
      this.backtest().longTermResults.map(
        (r) => r.result / this.backtest().capital / this.backtest().longTermDuration / 12,
      ),
    ),
  );
  worstDrawdownAmount = computed(() =>
    Math.max(...this.backtest().longTermResults.map((r) => r.drawdownAmount)),
  );
  worstDrawdownPercent = computed(() =>
    Math.max(...this.backtest().longTermResults.map((r) => r.drawdownPercent)),
  );
  averageRewardRatio = computed(() =>
    avg(this.backtest().longTermResults.map((r) => r.result / r.drawdownAmount)),
  );
}

function avg(v: number[]) {
  return v.reduce((a, b) => a + b, 0) / v.length;
}
