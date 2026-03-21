import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { RebReportService } from '../services/reb-report.service';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
import { BacktestPassAnalysis } from '@shared/models/backtest-pass-analysis';

@Component({
  selector: 'app-analysis',
  imports: [MatButtonModule, MatTableModule],
  template: `
    @if (analysis) {
      <table mat-table [dataSource]="analysis" class="mat-elevation-z8">
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef>Pass</th>
          <td mat-cell *matCellDef="let pass">{{ pass.id }}</td>
        </ng-container>

        <ng-container matColumnDef="ok">
          <th mat-header-cell *matHeaderCellDef>Ok</th>
          <td mat-cell *matCellDef="let pass">{{ pass.ok ? 'OK' : 'NOK' }}</td>
        </ng-container>

        @for (col of checkColumns; track col) {
          <ng-container [matColumnDef]="col">
            <th mat-header-cell *matHeaderCellDef>
              {{ col }}
            </th>

            <td mat-cell *matCellDef="let pass">
              {{ pass.checksMap[col]?.worstValue }}
              {{ pass.checksMap[col]?.rate }}
            </td>
          </ng-container>
        }

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
      </table>
    }
  `,
})
export class Analysis implements OnInit {
  private rebReportService = inject(RebReportService);
  private reportId = inject(ActivatedRoute).snapshot.paramMap.get('reportId')!;
  analysis?: BacktestPassAnalysis[];
  displayedColumns: string[] = ['id', 'ok'];
  checkColumns: string[] = [];
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.rebReportService.analyze(this.reportId).subscribe((analysis) => {
      this.analysis = analysis.map((pass) => ({
        ...pass,
        checksMap: Object.fromEntries(pass.checks.map((c) => [c.type, c])),
      }));

      if (analysis.length) {
        this.checkColumns = analysis[0].checks.map((c) => c.type);
        this.displayedColumns = ['id', 'ok', ...this.checkColumns];
      }

      this.cdr.detectChanges();
    });
  }
}
