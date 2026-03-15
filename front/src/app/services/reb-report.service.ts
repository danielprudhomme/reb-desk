import { inject, Injectable } from '@angular/core';
import { RebReport } from '@shared/models/reb-report';
import { Observable } from 'rxjs';
import { GET_REB_REPORTS } from './reb-report.graphql';
import { HttpClient } from '@angular/common/http';
import { GraphQlService } from '../core/graphql/graphql.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { environment } from '@env';

@Injectable({ providedIn: 'root' })
export class RebReportService extends GraphQlService {
  private httpClient = inject(HttpClient);

  reports = toSignal(this.query$<RebReport[]>(GET_REB_REPORTS, 'rebReports'));

  sync(): Observable<unknown> {
    return this.httpClient.get(`${environment.apiUrl}/sync`);
  }

  import(folderPath: string): Observable<unknown> {
    return this.httpClient.post(`${environment.apiUrl}/import`, { folderPath });
  }
}
