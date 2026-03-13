import { inject, Injectable } from '@angular/core';
import { OptimizationReport } from '@shared/models/optimization-report';
import { Observable } from 'rxjs';
import { GET_OPTIMIZATION_REPORTS } from './optimization-report.graphql';
import { HttpClient } from '@angular/common/http';
import { GraphQlService } from '../core/graphql/graphql.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { environment } from '@env';

@Injectable({ providedIn: 'root' })
export class OptimizationReportsService extends GraphQlService {
  private httpClient = inject(HttpClient);

  reports = toSignal(
    this.query$<OptimizationReport[]>(GET_OPTIMIZATION_REPORTS, 'optimizationReports'),
  );

  sync(): Observable<unknown> {
    return this.httpClient.get(`${environment.apiUrl}/sync`);
  }
}
