import { Component, computed, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { ExpertBadge } from '@app/shared/components/expert-badge';
import { RobotStatusBadge } from './robot-status-badge';
// import { PassAnalysisTable } from '@app/features/report/components/pass-analysis-table';
import { AnalysisRequest } from '@shared/models/analysis-request';
import { Robot } from '@shared/models/robot';
import { AnalyzedBacktestsTable } from '@app/features/backtest/analyzed-backtests-table';

@Component({
  selector: 'app-robot-drawer',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTabsModule,
    ExpertBadge,
    RobotStatusBadge,
    AnalyzedBacktestsTable,
  ],
  template: `
    <div class="h-full flex flex-col p-4">
      <!-- HEADER -->
      <div class="relative pb-4 border-b border-white/10">
        <div class="absolute top-0 right-0 flex gap-1">
          <button mat-icon-button [matMenuTriggerFor]="menu" aria-label="Robot settings">
            <mat-icon>settings</mat-icon>
          </button>

          <button mat-icon-button (click)="close.emit()" aria-label="Close drawer">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <div class="flex items-center gap-4">
          <app-expert-badge [expert]="robot().strategyContext.expert" />
          <div class="text-sm font-medium">
            {{ robot().strategyContext.symbol }} · {{ robot().strategyContext.timeframe }}
          </div>
          <app-robot-status-badge [status]="robot().status" />
        </div>
      </div>

      <!-- CONTENT SLOT -->
      <div class="flex-1 pt-4 overflow-hidden">
        <mat-tab-group class="h-full">
          <mat-tab label="Choose pass">
            <div class="h-full overflow-auto">
              <app-analyzed-backtests-table [request]="analysisRequest()" />
            </div>
          </mat-tab>

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
  capital = input.required<number>();
  robot = input.required<Robot>();
  close = output<void>();
  delete = output<Robot>();
  analysisRequest = computed<AnalysisRequest>(() => ({
    strategyContextId: this.robot().strategyContext.id,
    thresholds: [
      {
        type: 'longTermResultPercent',
        operator: '>',
        value: 0,
        passRate: 100,
        weight: 3,
      },
      {
        type: 'longTermResultPercent',
        operator: '<',
        value: 15,
        passRate: 100,
        weight: 3,
      },
      {
        type: 'longTermDrawdownPercent',
        operator: '<',
        value: 20,
        passRate: 100,
        weight: 3,
      },
      {
        type: 'longTermGainLossRatio',
        operator: '>',
        value: 1,
        passRate: 100,
        weight: 1,
      },
      {
        type: 'shortTermResultPercent',
        operator: '>',
        value: 0,
        passRate: 90,
        weight: 2,
      },
      {
        type: 'shortTermDrawdownPercent',
        operator: '<',
        value: 5,
        passRate: 100,
        weight: 3,
      },
    ],
  }));
}
