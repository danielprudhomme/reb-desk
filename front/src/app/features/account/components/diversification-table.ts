import { Component, computed, input } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Robot } from '@shared/models/robot';
import { symbols, Symbol } from '@shared/models/symbol';
import { timeframes, Timeframe } from '@shared/models/timeframe';
import { EXPERT_NAMES } from '@shared/constants/expert.constants';

@Component({
  selector: 'app-diversification-table',
  imports: [MatTableModule],
  template: `
    <table mat-table [dataSource]="dataSource()">
      <ng-container matColumnDef="symbol" [sticky]="true">
        <th mat-header-cell *matHeaderCellDef>Symbol</th>
        <td mat-cell *matCellDef="let row">{{ row.symbol }}</td>
      </ng-container>

      @for (timeframe of displayedTimeframes(); let index = $index; track timeframe) {
        <ng-container [matColumnDef]="timeframe">
          <th mat-header-cell *matHeaderCellDef>{{ timeframe }}</th>

          <td mat-cell *matCellDef="let row">
            {{ $any(expertNames)[row[timeframe.toLowerCase()]] }}
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
  expertNames = EXPERT_NAMES;
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

  getExpert(timeframe: Timeframe, symbol: Symbol): string | null {
    const robot = this.robots().find((r) => r.timeframe === timeframe && r.symbol === symbol);

    return robot?.expert ?? null;
  }

  getExpertClass(expert: string): string {
    switch (expert) {
      case 'candleSuite':
        return 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30';

      case 'emaBb':
        return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';

      case 'rsiBreak':
        return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';

      case 'autoBot':
        return 'bg-orange-500/20 text-orange-300 border border-orange-500/30';

      case 'strategyCreator':
        return 'bg-pink-500/20 text-pink-300 border border-pink-500/30';

      default:
        return 'bg-neutral-800 text-neutral-200 border border-neutral-700';
    }
  }
}
