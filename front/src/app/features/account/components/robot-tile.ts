import { Component, input, computed } from '@angular/core';
import { Robot } from '@shared/models/robot';
import { ExpertBadge } from '@app/shared/components/expert-badge';
import { RobotStatusBadge } from './robot-status-badge';
import { DecimalPipe, PercentPipe } from '@angular/common';

@Component({
  selector: 'app-robot-tile',
  standalone: true,
  imports: [ExpertBadge, RobotStatusBadge, PercentPipe, DecimalPipe],
  template: `
    <div
      class="relative rounded-xl border border-white/10 bg-white/5
             hover:bg-white/10 transition-all p-3 min-h-[90px]
             flex flex-col justify-between"
    >
      <!-- Status -->
      <app-robot-status-badge class="absolute top-2 right-2" [status]="robot().status" />

      <!-- Expert -->
      <div class="pr-14">
        <app-expert-badge [expert]="robot().expert" />
      </div>

      <!-- Metrics -->
      <div class="flex gap-3 text-xs mt-3 opacity-80">
        <div>
          <span class="opacity-50">Result</span>
          <span class="ml-1 font-medium">
            {{ averageMonthlyPerformance() | percent: '1.2-2' }}
          </span>
        </div>

        <div>
          <span class="opacity-50">DD %</span>
          <span class="ml-1 font-medium">
            {{ worstDrawdownPercent() / 100 | percent: '1.2-2' }}
          </span>
        </div>

        <div>
          <span class="opacity-50">DD</span>
          <span class="ml-1 font-medium"> {{ worstDrawdownAmount() | number: '1.0-0' }} € </span>
        </div>
      </div>
    </div>
  `,
})
export class RobotTile {
  robot = input.required<Robot>();

  backtest = computed(() => this.robot().parameterSet?.backtests[0]);
  averageMonthlyPerformance = computed(() => {
    const backtest = this.backtest();
    if (!backtest) {
      return undefined;
    }
    return (
      avg(backtest.longTermResults.map((r) => r.result)) /
      backtest.capital /
      backtest.longTermDuration /
      12
    );
  });

  worstDrawdownAmount = computed(() =>
    Math.max(...(this.backtest()?.longTermResults.map((r) => r.drawdownAmount) || [])),
  );
  worstDrawdownPercent = computed(() =>
    Math.max(...(this.backtest()?.longTermResults.map((r) => r.drawdownPercent) || [])),
  );
}

function avg(v: number[]) {
  return v.reduce((a, b) => a + b, 0) / v.length;
}
