import { Component, computed, inject, input, output } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Symbol } from '@shared/models/symbol';
import { Timeframe } from '@shared/models/timeframe';
import { MatMenuModule } from '@angular/material/menu';
import { RobotService } from '@app/services/robot.service';
import { ExpertAdvisor } from '@shared/models/expert-advisor';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmationService } from '@app/core/services/confirmation.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RobotTile } from './robot-tile';
import { RobotCreateTile } from './robot-create-tile';
import { Robot } from '@shared/models/robot';

@Component({
  selector: 'app-robot-table',
  imports: [
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
          @let count = robots().filter((r) => r.strategyContext.timeframe === timeframe).length;

          <th mat-header-cell *matHeaderCellDef [matTooltip]="count + ' robots'">
            {{ timeframe }}
          </th>

          <td mat-cell *matCellDef="let row" class="group !py-3">
            @let robots = row[timeframe.toLowerCase()];

            <div class="flex gap-1 flex-col">
              @for (robot of robots; track $index) {
                <div class="cursor-pointer" (click)="robotClicked.emit(robot)">
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
  `,
})
export class RobotTable {
  accountId = input.required<string>();
  robots = input.required<Robot[]>();
  timeframes = input.required<Timeframe[]>();
  symbols = input.required<Symbol[]>();
  robotClicked = output<Robot>();
  private robotService = inject(RobotService);
  private confirmationService = inject(ConfirmationService);
  displayedColumns = computed(() => ['symbol', ...this.timeframes()]);
  dataSource = computed(() => {
    const robots = this.robots();

    const rows = this.symbols().map((symbol) => {
      const row: Record<string, Robot[] | string> = { symbol };

      for (const timeframe of this.timeframes()) {
        const robotsOnTimeframe = robots.filter(
          (r) => r.strategyContext.symbol === symbol && r.strategyContext.timeframe === timeframe,
        );
        row[timeframe.toLowerCase()] = robotsOnTimeframe;
      }

      return row;
    });

    return new MatTableDataSource(rows);
  });

  // modifyRobot(robot: Robot) {}

  createRobot(timeframe: Timeframe, symbol: Symbol, expert: ExpertAdvisor) {
    this.robotService.insertRobot(this.accountId(), { expert, symbol, timeframe });
  }
}
