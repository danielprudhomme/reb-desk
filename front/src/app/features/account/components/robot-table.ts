import { Component, computed, inject, input } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Symbol, symbols } from '@shared/models/symbol';
import { Timeframe } from '@shared/models/timeframe';
import { ExpertBadge } from '@app/shared/components/expert-badge';
import { Robot } from '@app/core/models/robot';
import { MatMenuModule } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { RobotService } from '@app/services/robot.service';
import { ExpertAdvisor, expertAdvisors } from '@shared/models/expert-advisor';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-robot-table',
  imports: [MatIcon, MatTableModule, MatMenuModule, MatButtonModule, ExpertBadge],
  template: `
    <table mat-table [dataSource]="dataSource()">
      <ng-container matColumnDef="symbol" [sticky]="true">
        <th mat-header-cell *matHeaderCellDef></th>
        <td mat-cell *matCellDef="let row">{{ row.symbol }}</td>
      </ng-container>

      @for (timeframe of timeframes(); let index = $index; track timeframe) {
        <ng-container [matColumnDef]="timeframe">
          <th mat-header-cell *matHeaderCellDef>{{ timeframe }}</th>

          <td mat-cell *matCellDef="let row" class="group">
            @if (row[timeframe.toLowerCase()]; as robot) {
              <app-expert-badge
                [expert]="robot.expert"
                class="cursor-pointer"
                [matMenuTriggerFor]="robotOptionsMenu"
                [matMenuTriggerData]="{ robot: robot }"
              />
            } @else {
              <div
                class="opacity-0 group-hover:opacity-100 transition-opacity"
                [class.opacity-100]="menuTrigger.menuOpen"
              >
                <button
                  matButton
                  #menuTrigger="matMenuTrigger"
                  [matMenuTriggerFor]="createRobotMenu"
                  [matMenuTriggerData]="{ timeframe: timeframe, symbol: row.symbol }"
                >
                  + New Robot
                </button>
              </div>
            }
          </td>
        </ng-container>
      }

      <tr mat-header-row *matHeaderRowDef="displayedColumns(); sticky: true"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns()"></tr>
    </table>

    <mat-menu #robotOptionsMenu="matMenu">
      <ng-template matMenuContent let-robot="robot">
        <!-- <button mat-menu-item (click)="modifyRobot(robot)">
          <mat-icon>edit</mat-icon>
          <span>Edit</span>
        </button> -->
        <button mat-menu-item (click)="deleteRobot(robot)">
          <mat-icon>delete</mat-icon>
          <span>Delete</span>
        </button>
      </ng-template>
    </mat-menu>

    <mat-menu #createRobotMenu="matMenu">
      <ng-template matMenuContent let-timeframe="timeframe" let-symbol="symbol">
        @for (expert of experts; track expert) {
          <button mat-menu-item (click)="createRobot(timeframe, symbol, expert)">
            <app-expert-badge [expert]="expert" />
          </button>
        }
      </ng-template>
    </mat-menu>
  `,
})
export class RobotTable {
  accountId = input.required<string>();
  robots = input.required<Robot[]>();
  timeframes = input<Timeframe[]>(['M15', 'M20', 'M30', 'H1']);
  symbols = input<Symbol[]>(symbols.filter((s) => !s.includes('XAU')));
  private robotService = inject(RobotService);
  displayedColumns = computed(() => ['symbol', ...this.timeframes()]);
  experts = expertAdvisors;
  dataSource = computed(() => {
    const robots = this.robots();

    const rows = this.symbols().map((symbol) => {
      const row: Record<string, unknown> = { symbol };

      for (const timeframe of this.timeframes()) {
        const robot = robots.find((r) => r.symbol === symbol && r.timeframe === timeframe);
        row[timeframe.toLowerCase()] = robot;
      }

      return row;
    });

    return new MatTableDataSource(rows);
  });

  // modifyRobot(robot: Robot) {}

  createRobot(timeframe: Timeframe, symbol: Symbol, expert: ExpertAdvisor) {
    this.robotService.upsertRobot({
      accountId: this.accountId(),
      expert,
      symbol,
      timeframe,
      status: 'inProgress',
      parameters: [],
    });
  }

  async deleteRobot(robot: Robot) {
    await this.robotService.deleteRobot(robot);
  }
}
