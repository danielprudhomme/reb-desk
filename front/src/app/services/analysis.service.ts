import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { GraphQlService } from '../core/graphql/graphql.service';
import { environment } from '@env';
import { AnalysisRequest } from '@shared/models/analysis-request';
import { AnalyzedGroupedBacktest } from '@shared/models/backtest';

@Injectable({ providedIn: 'root' })
export class AnalysisService extends GraphQlService {
  private httpClient = inject(HttpClient);

  async analyze(request: AnalysisRequest): Promise<AnalyzedGroupedBacktest[]> {
    return await firstValueFrom(
      this.httpClient.post<AnalyzedGroupedBacktest[]>(`${environment.apiUrl}/analyze`, request),
    );
  }
}
