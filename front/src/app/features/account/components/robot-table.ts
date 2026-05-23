import { Component, computed, inject, input } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Symbol } from '@shared/models/symbol';
import { Timeframe } from '@shared/models/timeframe';
import { Robot } from '@app/core/models/robot';
import { MatMenuModule } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { RobotService } from '@app/services/robot.service';
import { ExpertAdvisor } from '@shared/models/expert-advisor';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmationService } from '@app/core/services/confirmation.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RobotTile } from './robot-tile';
import { RobotCreateTile } from './robot-create-tile';

@Component({
  selector: 'app-robot-table',
  imports: [
    MatIcon,
    MatTableModule,
    MatMenuModule,
    MatButtonModule,
    MatTooltipModule,
    RobotTile,
    RobotCreateTile,
  ],
  template: `
    <table mat-table [dataSource]="dataSource()">
      <ng-container matColumnDef="symbol" [sticky]="true">
        <th mat-header-cell *matHeaderCellDef></th>
        <td mat-cell *matCellDef="let row">{{ row.symbol }}</td>
      </ng-container>

      @for (timeframe of timeframes(); let index = $index; track timeframe) {
        <ng-container [matColumnDef]="timeframe">
          @let count = robots().filter((r) => r.timeframe === timeframe).length;

          <th mat-header-cell *matHeaderCellDef [matTooltip]="count + ' robots'">
            {{ timeframe }}
          </th>

          <td mat-cell *matCellDef="let row" class="group !py-3">
            @let robots = row[timeframe.toLowerCase()];

            <div class="flex gap-1 flex-col">
              @for (robot of robots; track $index) {
                <div [matMenuTriggerFor]="robotOptionsMenu" [matMenuTriggerData]="{ robot: robot }">
                  <app-robot-tile [robot]="robot" />
                </div>
              } @empty {
                <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                  <app-robot-create-tile
                    [timeframe]="timeframe"
                    [symbol]="row.symbol"
                    (created)="createRobot(timeframe, row.symbol, $event)"
                  />
                </div>
              }
            </div>
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
  `,
})
export class RobotTable {
  accountId = input.required<string>();
  robots = input.required<Robot[]>();
  timeframes = input.required<Timeframe[]>();
  symbols = input.required<Symbol[]>();
  private robotService = inject(RobotService);
  private confirmationService = inject(ConfirmationService);
  displayedColumns = computed(() => ['symbol', ...this.timeframes()]);
  dataSource = computed(() => {
    const robots = this.robots();

    const rows = this.symbols().map((symbol) => {
      const row: Record<string, Robot[] | string> = { symbol };

      for (const timeframe of this.timeframes()) {
        const robotsOnTimeframe = robots.filter(
          (r) => r.symbol === symbol && r.timeframe === timeframe,
        );
        row[timeframe.toLowerCase()] = robotsOnTimeframe;
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
      status: 'draft',
      parameters: [],
    });
  }

  deleteRobot(robot: Robot) {
    this.confirmationService
      .confirm({ message: 'Are you sure to delete this robot ?', title: 'Delete Robot' })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.robotService.deleteRobot(robot);
        }
      });
  }
}
