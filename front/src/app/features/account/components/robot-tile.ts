import { Component, input } from '@angular/core';
import { Robot } from '@shared/models/robot';
import { ExpertBadge } from '@app/shared/components/expert-badge';
import { RobotStatusBadge } from './robot-status-badge';

@Component({
  selector: 'app-robot-tile',
  standalone: true,
  imports: [ExpertBadge, RobotStatusBadge],
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
}
