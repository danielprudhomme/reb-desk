import { Component, inject, input, resource } from '@angular/core';
import { RebReportService } from '../../../services/reb-report.service';
import { firstValueFrom } from 'rxjs';
import { PassAnalysisTable } from './pass-analysis-table';
import { ReportFilter } from '@shared/models/report-filter';

@Component({
  selector: 'app-filter-analysis-result',
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
export class FilterAnalysisResult {
  filter = input.required<ReportFilter>();
  private rebReportService = inject(RebReportService);
  analysisResource = resource({
    loader: async () => firstValueFrom(this.rebReportService.analyze(this.filter())),
  });
}
