import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { Timeframe } from '@shared/models/timeframe';
import { Symbol } from '@shared/models/symbol';
import { MatMenuModule } from '@angular/material/menu';
import { ExpertBadge } from '@app/shared/components/expert-badge';
import { ExpertAdvisor, expertAdvisors } from '@shared/models/expert-advisor';

@Component({
  selector: 'app-robot-create-tile',
  imports: [MatMenuModule, ExpertBadge],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div
      class="relative rounded-xl border border-dashed border-white/15
             bg-white/5 hover:bg-white/10 transition-all
             min-h-[90px] flex items-center justify-center
             cursor-pointer"
      #menuTrigger="matMenuTrigger"
      [matMenuTriggerFor]="createRobotMenu"
    >
      <div class="text-xs opacity-60">+ New Robot</div>
    </div>

    <mat-menu #createRobotMenu="matMenu">
      <ng-template matMenuContent let-timeframe="timeframe" let-symbol="symbol">
        @for (expert of experts; track expert) {
          <button mat-menu-item (click)="created.emit(expert)">
            <app-expert-badge [expert]="expert" />
          </button>
        }
      </ng-template>
    </mat-menu>
  `,
})
export class RobotCreateTile {
  timeframe = input.required<Timeframe>();
  symbol = input.required<Symbol>();
  created = output<ExpertAdvisor>();
  experts = expertAdvisors;
}
