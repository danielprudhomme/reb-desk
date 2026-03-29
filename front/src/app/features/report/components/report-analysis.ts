import { Component, inject, resource } from '@angular/core';
import { RebReportService } from '../../../services/reb-report.service';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PassAnalysisTable } from './pass-analysis-table';

@Component({
  selector: 'app-report-analysis',
  imports: [PassAnalysisTable],
  template: `
    <div class="h-full w-full">
      @if (analysisResource.isLoading()) {
        Analysis loading...
      }

      @if (analysisResource.value(); as analysis) {
        <app-pass-analysis-table [analysis]="analysis" />
      }
    </div>
  `,
})
export class ReportAnalysis {
  private rebReportService = inject(RebReportService);
  private reportId = inject(ActivatedRoute).snapshot.paramMap.get('reportId')!;
  analysisResource = resource({
    loader: async () => {
      return firstValueFrom(this.rebReportService.analyze({ reportId: this.reportId }));
    },
  });
}
