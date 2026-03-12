import { inject, Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import { OptimizationReport } from '@shared/models/optimization-report';
import { map, Observable } from "rxjs";
import { GET_OPTIMIZATION_REPORTS } from "./optimization-report.graphql";
 
@Injectable({ providedIn: 'root' })
export class OptimizationReportsService {
  private apollo = inject(Apollo);
 
  getAll(): Observable<OptimizationReport[]> {
    return this.apollo
      .watchQuery<{ optimizationReports: OptimizationReport[] }>({ query: GET_OPTIMIZATION_REPORTS })
      .valueChanges.pipe(map(({ data }) => (data?.optimizationReports ?? []) as OptimizationReport[]));
  }
}
