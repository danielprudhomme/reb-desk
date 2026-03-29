import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PassAnalysisTable } from './pass-analysis-table';

@Component({
  selector: 'app-report-analysis',
  imports: [PassAnalysisTable],
  template: ` <div class="h-full overflow-auto">
    <app-pass-analysis-table [filter]="{ reportId: reportId }" />
  </div>`,
})
export class ReportAnalysis {
  reportId = inject(ActivatedRoute).snapshot.paramMap.get('reportId')!;
}
