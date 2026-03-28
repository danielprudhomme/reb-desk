import { Component, effect, inject, resource } from '@angular/core';
import { RebReportService } from '../../services/reb-report.service';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PassAnalysisTable } from './pass-analysis-table';

@Component({
  selector: 'app-report-analysis',
  imports: [PassAnalysisTable],
  template: `
    @let analysis = analyzeResource.value();
    <div class="h-full w-full">
      @if (analysis) {
        <app-pass-analysis-table [analysis]="analysis" />
      } @else {
        Loading...
      }
    </div>
  `,
})
export class ReportAnalysis {
  private rebReportService = inject(RebReportService);
  private reportId = inject(ActivatedRoute).snapshot.paramMap.get('reportId')!;
  analyzeResource = resource({
    loader: async () => {
      return firstValueFrom(this.rebReportService.analyze({ reportId: this.reportId }));
    },
  });

  constructor() {
    effect(() => {
      console.log('rrr', this.analyzeResource.value());
    });
  }
}
