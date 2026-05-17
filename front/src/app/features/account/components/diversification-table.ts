import { Component, computed, input } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { symbols } from '@shared/models/symbol';
import { timeframes } from '@shared/models/timeframe';
import { ExpertBadge } from '@app/shared/components/expert-badge';
import { Robot } from '@app/core/models/robot';

@Component({
  selector: 'app-diversification-table',
  imports: [MatTableModule, ExpertBadge],
  template: `
    <table mat-table [dataSource]="dataSource()">
      <ng-container matColumnDef="symbol" [sticky]="true">
        <th mat-header-cell *matHeaderCellDef>{{ robots().length }} robots</th>
        <td mat-cell *matCellDef="let row">{{ row.symbol }}</td>
      </ng-container>

      @for (timeframe of displayedTimeframes(); let index = $index; track timeframe) {
        <ng-container [matColumnDef]="timeframe">
          <th mat-header-cell *matHeaderCellDef>{{ timeframe }}</th>

          <td mat-cell *matCellDef="let row">
            @if (row[timeframe.toLowerCase()]; as expert) {
              <app-expert-badge [expert]="expert" />
            }
          </td>
        </ng-container>
      }

      <tr mat-header-row *matHeaderRowDef="displayedColumns(); sticky: true"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns()"></tr>
    </table>
  `,
})
export class DiversificationTable {
  robots = input.required<Robot[]>();
  displayedSymbols = computed(() => {
    const usedSymbols = new Set(this.robots().map((r) => r.symbol));
    return symbols.filter((s) => usedSymbols.has(s));
  });
  displayedTimeframes = computed(() => {
    const usedTimeframes = new Set(this.robots().map((r) => r.timeframe));
    return timeframes.filter((tf) => usedTimeframes.has(tf));
  });
  displayedColumns = computed(() => ['symbol', ...this.displayedTimeframes()]);
  dataSource = computed(() => {
    const robots = this.robots();

    if (!robots || robots.length === 0) return new MatTableDataSource([]);

    const rows = this.displayedSymbols().map((symbol) => {
      const row: Record<string, unknown> = { symbol };

      for (const timeframe of this.displayedTimeframes()) {
        const robot = robots.find((r) => r.symbol === symbol && r.timeframe === timeframe);
        row[timeframe.toLowerCase()] = robot?.expert ?? null;
      }

      return row;
    });

    return new MatTableDataSource(rows);
  });
}
