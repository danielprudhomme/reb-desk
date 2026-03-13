import { inject, Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { OptimizationReport } from '@shared/models/optimization-report';
import { map, Observable } from 'rxjs';
import { GET_OPTIMIZATION_REPORTS } from './optimization-report.graphql';
import { HttpClient } from '@angular/common/http';
import { GraphQlService } from '../core/graphql/graphql.service';
import { RequestState } from '../core/models/request-state.model';

@Injectable({ providedIn: 'root' })
export class OptimizationReportsService extends GraphQlService {
  private httpClient = inject(HttpClient);

  getAll(): Observable<RequestState<OptimizationReport[]>> {
    return this.query$(GET_OPTIMIZATION_REPORTS, 'optimizationReports');
  }

  sync(): Observable<any> {
    return this.httpClient.get('http://localhost:4000/sync');
  }
}
