import { inject, Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import { OptimizationReport } from '@shared/models/optimization-report';
import { map, Observable } from "rxjs";
import { GET_OPTIMIZATION_REPORTS } from "./optimization-report.graphql";
import { HttpClient } from "@angular/common/http";
 
@Injectable({ providedIn: 'root' })
export class OptimizationReportsService {
  private apollo = inject(Apollo);
  private httpClient = inject(HttpClient)
 
  getAll(): Observable<OptimizationReport[]> {
    return this.apollo
      .watchQuery<{ optimizationReports: OptimizationReport[] }>({ query: GET_OPTIMIZATION_REPORTS })
      .valueChanges.pipe(map(({ data }) => (data?.optimizationReports ?? []) as OptimizationReport[]));
  }

  sync(): Observable<any> {
    return this.httpClient.get('http://localhost:4000/sync');
  }
}
