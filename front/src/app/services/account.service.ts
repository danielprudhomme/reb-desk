import { inject, Injectable } from '@angular/core';
import { Account } from '@app/core/models/account';
import { GET_ACCOUNTS, UPSERT_ACCOUNT } from './account.graphql';
import { Apollo } from 'apollo-angular';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { AccountInput } from '@app/core/models/account.input';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private apollo = inject(Apollo);

  accounts$ = this.apollo.watchQuery<{ accounts: Account[] }>({
    query: GET_ACCOUNTS,
    fetchPolicy: 'cache-and-network',
  }).valueChanges;

  accounts = toSignal(
    this.accounts$.pipe(map((result) => (result.data?.accounts ?? []) as Account[])),
    {
      initialValue: [],
    },
  );

  upsertAccount(input: AccountInput) {
    return this.apollo.mutate<{ upsertAccount: Account }>({
      mutation: UPSERT_ACCOUNT,
      variables: { input },

      update: (cache, { data }) => {
        console.log('Mutation result:', data);
        if (!data?.upsertAccount) return;

        const newAccount = data.upsertAccount;

        // 1. Lire les accounts existants dans le cache
        const existing = cache.readQuery<{ accounts: Account[] }>({
          query: GET_ACCOUNTS,
        });

        if (!existing) return;

        const accounts = existing.accounts;

        // 2. Upsert logique (replace si existe, sinon add)
        const updatedAccounts = upsert(accounts, newAccount);

        // 3. Réécrire le cache
        cache.writeQuery({
          query: GET_ACCOUNTS,
          data: {
            accounts: updatedAccounts,
          },
        });
      },
    });
  }
}

function upsert(list: Account[], item: Account): Account[] {
  const index = list.findIndex((a) => a.id === item.id);

  if (index === -1) {
    return [...list, item];
  }

  const copy = [...list];
  copy[index] = item;

  return copy;
}
