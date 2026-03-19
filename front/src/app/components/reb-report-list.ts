import { Component, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { RebReportService } from '../services/reb-report.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-reb-report-list',
  imports: [MatButtonModule, MatTableModule],
  template: `
    @if (reports(); as reports) {
      <table mat-table [dataSource]="reports" class="mat-elevation-z8">
        <ng-container matColumnDef="expert">
          <th mat-header-cell *matHeaderCellDef>Expert</th>
          <td mat-cell *matCellDef="let report">{{ report.expert }}</td>
        </ng-container>

        <ng-container matColumnDef="symbol">
          <th mat-header-cell *matHeaderCellDef>Symbol</th>
          <td mat-cell *matCellDef="let report">{{ report.symbol }}</td>
        </ng-container>

        <ng-container matColumnDef="timeframe">
          <th mat-header-cell *matHeaderCellDef>Timeframe</th>
          <td mat-cell *matCellDef="let report">{{ report.timeframe }}</td>
        </ng-container>

        <ng-container matColumnDef="startDate">
          <th mat-header-cell *matHeaderCellDef>Start Date</th>
          <td mat-cell *matCellDef="let report">{{ report.startDate }}</td>
        </ng-container>

        <ng-container matColumnDef="shortTerm">
          <th mat-header-cell *matHeaderCellDef>Short Term</th>
          <td mat-cell *matCellDef="let report">
            {{ report.shortTermCount }} x {{ report.shortTermDuration }} {{ report.shortTermUnit }}
          </td>
        </ng-container>

        <ng-container matColumnDef="longTerm">
          <th mat-header-cell *matHeaderCellDef>Long Term</th>
          <td mat-cell *matCellDef="let report">
            {{ report.longTermDuration }} {{ report.longTermUnit }}
          </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let report">
            <button matButton="filled" (click)="analyze(report.id)">Analyze</button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
      </table>
    }
  `,
})
export class RebReportList {
  private rebReportService = inject(RebReportService);
  reports = this.rebReportService.reports;
  displayedColumns: string[] = [
    'expert',
    'symbol',
    'timeframe',
    'startDate',
    'shortTerm',
    'longTerm',
    'actions',
  ];

  analyze(reportId: string) {
    this.rebReportService.analyze(reportId).subscribe();
  }
}
