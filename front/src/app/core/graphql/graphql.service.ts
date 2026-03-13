import { inject } from '@angular/core';
import { Apollo, TypedDocumentNode } from 'apollo-angular';
import { map, Observable } from 'rxjs';

export abstract class GraphQlService {
  private apollo = inject(Apollo);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query$<T>(query: TypedDocumentNode<any, any>, key: string): Observable<T | undefined> {
    return this.apollo
      .watchQuery<{ [key]: T }>({ query })
      .valueChanges.pipe(map((result) => (result.data?.[key] as T) ?? undefined));
  }
}
