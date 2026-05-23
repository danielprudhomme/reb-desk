import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { Robot } from '@app/core/models/robot';
import { ExpertBadge } from '@app/shared/components/expert-badge';
import { RobotStatusBadge } from './robot-status-badge';

@Component({
  selector: 'app-robot-drawer',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTabsModule,
    ExpertBadge,
    RobotStatusBadge,
  ],
  template: `
    <div class="h-full flex flex-col p-4">
      <!-- HEADER -->
      <div class="relative pb-4 border-b border-white/10">
        <!-- top right actions -->
        <div class="absolute top-0 right-0 flex gap-1">
          <!-- settings -->
          <button mat-icon-button [matMenuTriggerFor]="menu" aria-label="Robot settings">
            <mat-icon>settings</mat-icon>
          </button>

          <!-- close -->
          <button mat-icon-button (click)="close.emit()" aria-label="Close drawer">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <div class="flex items-center gap-4">
          <!-- expert -->
          <app-expert-badge [expert]="robot().expert" />

          <!-- symbol + timeframe -->
          <div class="text-sm font-medium">{{ robot().symbol }} · {{ robot().timeframe }}</div>

          <!-- status -->
          <app-robot-status-badge [status]="robot().status" />
        </div>
      </div>

      <!-- CONTENT SLOT -->
      <div class="flex-1 overflow-auto pt-4">
        <mat-tab-group>
          <mat-tab label="Choose pass"> choose pass</mat-tab>
          <mat-tab label="Parameters"> Content 2 </mat-tab>
          <mat-tab label="History"> Content 3 </mat-tab>
        </mat-tab-group>
      </div>

      <!-- MENU -->
      <mat-menu #menu="matMenu">
        <button mat-menu-item (click)="delete.emit(robot())">
          <mat-icon>delete</mat-icon>
          <span>Delete</span>
        </button>
      </mat-menu>
    </div>
  `,
})
export class RobotDrawer {
  robot = input.required<Robot>();
  close = output<void>();
  delete = output<Robot>();
}
