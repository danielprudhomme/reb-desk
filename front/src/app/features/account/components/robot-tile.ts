import { Component, computed, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { Robot } from '@app/core/models/robot';
import { ExpertBadge } from '@app/shared/components/expert-badge';

@Component({
  selector: 'app-robot-tile',
  standalone: true,
  imports: [NgClass, ExpertBadge],
  template: `
    <div
      class="relative rounded-xl border border-white/10 bg-white/5
             hover:bg-white/10 transition-all p-3 min-h-[90px]
             flex flex-col justify-between"
    >
      <!-- Status -->
      <div
        class="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-medium"
        [ngClass]="statusClass()"
      >
        <div class="w-2 h-2 rounded-full bg-current"></div>
        <span class="capitalize">{{ robot().status }}</span>
      </div>

      <!-- Expert -->
      <div class="pr-14">
        <app-expert-badge [expert]="robot().expert" />
      </div>

      <!-- Metrics -->
      <div class="flex gap-3 text-xs mt-3 opacity-80">
        <div>
          <span class="opacity-50">WR</span>
          <span class="ml-1 font-medium"> {{ '--' }}% </span>
        </div>

        <div>
          <span class="opacity-50">PF</span>
          <span class="ml-1 font-medium">
            {{ '--' }}
          </span>
        </div>

        <div>
          <span class="opacity-50">DD</span>
          <span class="ml-1 font-medium"> {{ '--' }}% </span>
        </div>
      </div>
    </div>
  `,
})
export class RobotTile {
  robot = input.required<Robot>();

  statusClass = computed(() => {
    switch (this.robot().status) {
      case 'draft':
        return 'text-zinc-400';

      case 'configured':
        return 'text-sky-400';

      case 'analyzed':
        return 'text-amber-400';

      case 'validated':
        return 'text-emerald-400';

      case 'invalid':
        return 'text-rose-400';

      case 'live':
        return 'text-green-500';

      default:
        return 'text-zinc-400';
    }
  });
}
