import { inject, Injectable } from '@angular/core';
import { Account } from '@app/core/models/account';
import { DELETE_ACCOUNT, GET_ACCOUNTS, UPSERT_ACCOUNT } from './account.graphql';
import { Apollo } from 'apollo-angular';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom, map } from 'rxjs';
import { AccountInput } from '@app/core/models/account.input';
import { ApolloCache } from '@apollo/client/cache';

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

  async deleteAccount(id: string) {
    await firstValueFrom(
      this.apollo.mutate<{ deleteAccount: boolean }>({
        mutation: DELETE_ACCOUNT,
        variables: { id },

        update: (cache, { data }) => {
          if (!data?.deleteAccount) return;
          this.updateCachedAccounts(cache, (accounts) =>
            accounts.filter((account) => account.id !== id),
          );
        },
      }),
    );
  }

  async upsertAccount(input: AccountInput): Promise<string | undefined> {
    const result = await firstValueFrom(
      this.apollo.mutate<{ upsertAccount: Account }>({
        mutation: UPSERT_ACCOUNT,
        variables: { input },
        update: (cache, { data }) => {
          const newAccount = data?.upsertAccount;
          if (!newAccount) return;

          this.updateCachedAccounts(cache, (accounts) => {
            const index = accounts.findIndex((a) => a.id === newAccount.id);
            if (index === -1) {
              return [...accounts, newAccount];
            }
            const copy = [...accounts];
            copy[index] = newAccount;
            return copy;
          });
        },
      }),
    );

    return result.data?.upsertAccount.id;
  }

  private updateCachedAccounts(
    cache: ApolloCache,
    updateFn: (accounts: Account[]) => Account[],
  ): void {
    const existing = cache.readQuery<{ accounts: Account[] }>({ query: GET_ACCOUNTS });
    cache.writeQuery({
      query: GET_ACCOUNTS,
      data: { accounts: updateFn(existing?.accounts ?? []) },
    });
  }
}
