import { inject, Injectable, Signal } from '@angular/core';
import { Account, AccountInput } from '@app/core/models/account';
import { DELETE_ACCOUNT, GET_ACCOUNTS, UPSERT_ACCOUNT } from './account.graphql';
import { Apollo } from 'apollo-angular';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom, map } from 'rxjs';
import { Reference } from '@apollo/client';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private apollo = inject(Apollo);

  // ---------------------------
  // QUERY
  // ---------------------------
  accounts$ = this.apollo.watchQuery<{ accounts: Account[] }>({
    query: GET_ACCOUNTS,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  }).valueChanges;

  accounts = toSignal(this.accounts$.pipe(map((result) => result.data?.accounts ?? [])), {
    initialValue: [],
  }) as Signal<Account[]>;

  // ---------------------------
  // DELETE
  // ---------------------------
  async deleteAccount(id: string) {
    await firstValueFrom(
      this.apollo.mutate<{ deleteAccount: boolean }>({
        mutation: DELETE_ACCOUNT,
        variables: { id },

        update: (cache, { data }) => {
          if (!data?.deleteAccount) return;

          cache.modify({
            fields: {
              accounts(existingRefs: readonly Reference[] = [], { readField }) {
                return existingRefs.filter((ref) => readField('id', ref) !== id);
              },
            },
          });

          cache.evict({ id: cache.identify({ __typename: 'Account', id }) });

          cache.gc();
        },
      }),
    );
  }

  // ---------------------------
  // UPSERT
  // ---------------------------
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
              accounts(existingRefs: readonly Reference[] = [], { readField, toReference }) {
                const newRef = toReference({
                  __typename: 'Account',
                  id: account.id,
                })!;

                // remove old + add updated (safe + idempotent)
                const filtered = existingRefs.filter((ref) => readField('id', ref) !== account.id);

                return [...filtered, newRef];
              },
            },
          });
        },
      }),
    );

    return result.data?.upsertAccount.id;
  }
}
