import { inject, Injectable } from '@angular/core';
import { Account, AccountInput } from '@app/core/models/account';
import { DELETE_ACCOUNT, GET_ACCOUNTS, UPSERT_ACCOUNT } from './account.graphql';
import { Apollo } from 'apollo-angular';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom, map } from 'rxjs';
import { Reference } from '@apollo/client';
import { ModifierDetails } from '@apollo/client/cache';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private apollo = inject(Apollo);

  accounts$ = this.apollo.watchQuery<{ accounts: Account[] }>({
    query: GET_ACCOUNTS,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
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

          cache.modify({
            fields: {
              accounts(existingRefs: readonly Reference[] = [], { readField }: ModifierDetails) {
                return existingRefs.filter((ref) => readField('id', ref) !== id);
              },
            },
          });

          cache.evict({
            id: cache.identify({
              __typename: 'Account',
              id,
            }),
          });

          cache.gc();
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
          const account = data?.upsertAccount;

          if (!account) return;

          cache.modify({
            fields: {
              accounts(
                existingRefs: readonly Reference[] = [],
                { readField, toReference }: ModifierDetails,
              ) {
                const newRef = toReference({
                  __typename: 'Account',
                  id: account.id,
                });

                if (!newRef) return existingRefs;

                const exists = existingRefs.some((ref) => readField('id', ref) === account.id);

                if (exists) {
                  return existingRefs;
                }

                return [...existingRefs, newRef];
              },
            },
          });
        },
      }),
    );

    return result.data?.upsertAccount.id;
  }
}
