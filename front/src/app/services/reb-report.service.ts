import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { GraphQlService } from '../core/graphql/graphql.service';
import { environment } from '@env';
import { AnalysisRequest } from '@shared/models/analysis-request';
import { AnalyzedGroupedBacktest } from '@shared/models/backtest';

@Injectable({ providedIn: 'root' })
export class RebReportService extends GraphQlService {
  private httpClient = inject(HttpClient);

  // reports = toSignal(this.query$<RebReport[]>(GET_REB_REPORTS, 'rebReports'));

  import(folderPath: string): Observable<unknown> {
    return this.httpClient.post(`${environment.apiUrl}/report/import`, { folderPath });
  }

  analyze(request: AnalysisRequest): Observable<AnalyzedGroupedBacktest[]> {
    return this.httpClient.post<AnalyzedGroupedBacktest[]>(
      `${environment.apiUrl}/analyze`,
      request,
    );
  }
}
