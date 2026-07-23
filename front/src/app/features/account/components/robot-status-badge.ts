import { Component, computed, input, ChangeDetectionStrategy } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RobotStatus } from '@shared/models/robot-status';

@Component({
  selector: 'app-robot-status-badge',
  standalone: true,
  imports: [NgClass, MatTooltipModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div class="w-4 h-4 rounded-full" [ngClass]="bgColor()" [matTooltip]="tooltip()"></div>
  `,
})
export class RobotStatusBadge {
  status = input.required<RobotStatus>();

  tooltip = computed(() => {
    switch (this.status()) {
      case 'draft':
        return 'Draft';

      case 'configured':
        return 'Configured';

      case 'analyzed':
        return 'Analyzed';

      case 'validated':
        return 'Validated';

      case 'invalid':
        return 'Invalid';

      case 'live':
        return 'Live';

      default:
        return this.status();
    }
  });

  bgColor = computed(() => {
    switch (this.status()) {
      case 'draft':
        return 'bg-zinc-400';

      case 'configured':
        return 'bg-sky-400';

      case 'analyzed':
        return 'bg-amber-400';

      case 'validated':
        return 'bg-emerald-400';

      case 'invalid':
        return 'bg-rose-400';

      case 'live':
        return 'bg-green-500';

      default:
        return 'bg-zinc-400';
    }
  });
}
