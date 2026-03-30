import { Component, computed, inject, viewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RebReportService } from '../../../services/reb-report.service';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { RebReport } from '../../../core/models/reb-report';
import { EXPERT_NAMES } from '@shared/constants/expert.constants';

@Component({
  selector: 'app-reb-report-list',
  imports: [RouterLink, MatButtonModule, MatTableModule, MatSortModule],
  template: `
    <div class="h-full overflow-auto">
      <table mat-table [dataSource]="dataSource()" matSort>
        <ng-container matColumnDef="expert">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Expert</th>
          <td mat-cell *matCellDef="let report">{{ expertNames[report.expert] }}</td>
        </ng-container>

        <ng-container matColumnDef="symbol">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Symbol</th>
          <td mat-cell *matCellDef="let report">{{ report.symbol }}</td>
        </ng-container>

        <ng-container matColumnDef="timeframe">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Timeframe</th>
          <td mat-cell *matCellDef="let report">{{ report.timeframe }}</td>
        </ng-container>

        <ng-container matColumnDef="startDate">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Start Date</th>
          <td mat-cell *matCellDef="let report">{{ report.startDate }}</td>
        </ng-container>

        <ng-container matColumnDef="shortTerm">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Short Term</th>
          <td mat-cell *matCellDef="let report">
            {{ report.shortTermCount }} x {{ report.shortTermDuration }} {{ report.shortTermUnit }}
          </td>
        </ng-container>

        <ng-container matColumnDef="longTerm">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Long Term</th>
          <td mat-cell *matCellDef="let report">
            {{ report.longTermDuration }} {{ report.longTermUnit }}
          </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef mat-sort-header></th>
          <td mat-cell *matCellDef="let report">
            <button matButton="filled" [routerLink]="[report.id, 'analyze']">Analyze</button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
      </table>
    </div>
  `,
})
export class RebReportList {
  private sort = viewChild.required(MatSort);
  private rebReportService = inject(RebReportService);
  expertNames = EXPERT_NAMES;

  dataSource = computed(() => {
    const dataSource = new MatTableDataSource<RebReport>(this.rebReportService.reports());
    dataSource.sort = this.sort();
    return dataSource;
  });

  displayedColumns: string[] = [
    'expert',
    'symbol',
    'timeframe',
    'startDate',
    'shortTerm',
    'longTerm',
    'actions',
  ];
}
