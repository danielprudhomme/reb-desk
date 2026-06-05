import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GET_REB_REPORTS } from './reb-report.graphql';
import { HttpClient } from '@angular/common/http';
import { GraphQlService } from '../core/graphql/graphql.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { environment } from '@env';
import { RebReport } from '../core/models/reb-report';
import { GroupedReportAnalysis } from '@shared/models/grouped-report-analysis';
import { AnalysisRequest } from '@shared/models/analysis-request';

@Injectable({ providedIn: 'root' })
export class RebReportService extends GraphQlService {
  private httpClient = inject(HttpClient);

  reports = toSignal(this.query$<RebReport[]>(GET_REB_REPORTS, 'rebReports'));

  import(folderPath: string): Observable<unknown> {
    return this.httpClient.post(`${environment.apiUrl}/report/import`, { folderPath });
  }

  analyze(request: AnalysisRequest): Observable<GroupedReportAnalysis[]> {
    return this.httpClient.post<GroupedReportAnalysis[]>(`${environment.apiUrl}/analyze`, request);
  }
}
