import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PassAnalysisTable } from './pass-analysis-table';
import { ReportFilter } from '@shared/models/report-filter';

@Component({
  selector: 'app-report-analysis',
  imports: [PassAnalysisTable],
  template: `
    <div class="h-full overflow-auto">
      <app-pass-analysis-table [filter]="this.filter" />
    </div>
  `,
})
export class ReportAnalysis {
  reportId = inject(ActivatedRoute).snapshot.paramMap.get('reportId')!;
  filter: ReportFilter = { reportId: this.reportId, symbols: [], timeframes: [], experts: [] };
}
