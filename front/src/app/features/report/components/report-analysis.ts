import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PassAnalysisTable } from './pass-analysis-table';
import { AnalysisRequest } from '@shared/models/analysis-request';

@Component({
  selector: 'app-report-analysis',
  imports: [PassAnalysisTable],
  template: `
    <div class="h-full overflow-auto">
      <app-pass-analysis-table [request]="this.request" />
    </div>
  `,
})
export class ReportAnalysis {
  reportId = inject(ActivatedRoute).snapshot.paramMap.get('reportId')!;
  request: AnalysisRequest = {
    reportId: this.reportId,
    symbols: [],
    timeframes: [],
    experts: [],
    capital: 0,
    thresholds: [
      {
        type: 'longTermResultPercent',
        operator: '>',
        value: 0,
        passRate: 100,
        weight: 3,
      },
      {
        type: 'shortTermResultPercent',
        operator: '>',
        value: 0,
        passRate: 80,
        weight: 1,
      },
      {
        type: 'longTermGainLossRatio',
        operator: '>',
        value: 1,
        passRate: 100,
        weight: 3,
      },
      {
        type: 'shortTermTrades',
        operator: '>',
        value: 1,
        passRate: 100,
        weight: 0.5,
      },
      {
        type: 'shortTermDrawdownPercent',
        operator: '<',
        value: 15,
        passRate: 80,
        weight: 1,
      },
      {
        type: 'shortTermDrawdownPercent',
        operator: '<',
        value: 30,
        passRate: 100,
        weight: 1,
      },
      {
        type: 'longTermDrawdownAmount',
        operator: '<',
        value: 400,
        passRate: 100,
        weight: 1,
      },
    ],
  };
}
