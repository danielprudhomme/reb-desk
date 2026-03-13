import { inject } from '@angular/core';
import { Apollo, TypedDocumentNode } from 'apollo-angular';
import { catchError, map, Observable, of, startWith } from 'rxjs';
import { RequestState } from '../models/request-state.model';

export abstract class GraphQlService {
  private apollo = inject(Apollo);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query$<T>(query: TypedDocumentNode<any, any>, key: string): Observable<RequestState<T>> {
    return this.apollo.watchQuery<{ [key]: T }>({ query }).valueChanges.pipe(
      map((result) => ({
        status: 'success' as const,
        data: (result.data?.[key] as T) ?? null,
        error: null,
      })),
      catchError((error) => of({ status: 'error' as const, data: null, error })),
      startWith({ status: 'loading' as const, data: null, error: null }),
    );
  }
}
