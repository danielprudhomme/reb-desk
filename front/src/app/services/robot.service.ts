/* eslint-disable @typescript-eslint/no-explicit-any */
import { inject, Injectable, signal, Signal } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom, map } from 'rxjs';
import { Robot, RobotInput } from '@app/core/models/robot';
import { DELETE_ROBOT, GET_ROBOTS_BY_ACCOUNT, UPSERT_ROBOT } from './robot.graphql';
import { Reference } from '@apollo/client';
import { ModifierDetails } from '@apollo/client/cache';

@Injectable({ providedIn: 'root' })
export class RobotService {
  private apollo = inject(Apollo);
  robotsByAccount: Signal<Robot[]> = signal([]);

  setAccountId(accountId: string) {
    const robots$ = this.apollo
      .watchQuery<{ robotsByAccount: Robot[] }>({
        query: GET_ROBOTS_BY_ACCOUNT,
        variables: { accountId },
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        notifyOnNetworkStatusChange: true,
      })
      .valueChanges.pipe(map((result) => (result.data?.robotsByAccount ?? []) as Robot[]));

    this.robotsByAccount = toSignal(robots$, { initialValue: [] });
  }

  async deleteRobot(robot: Robot) {
    await firstValueFrom(
      this.apollo.mutate<{ deleteRobot: string }>({
        mutation: DELETE_ROBOT,
        variables: { id: robot.id },
        update: (cache, { data }) => {
          if (!data?.deleteRobot) return;

          cache.modify({
            fields: {
              robotsByAccount(existingRefs: readonly any[] = [], { readField }) {
                return existingRefs.filter((ref) => readField('id', ref) !== robot.id);
              },
            },
          });
        },
      }),
    );
  }

  async upsertRobot(input: RobotInput) {
    await firstValueFrom(
      this.apollo.mutate<{ upsertRobot: Robot }>({
        mutation: UPSERT_ROBOT,
        variables: { input },

        update: (cache, { data }) => {
          const robot = data?.upsertRobot;
          if (!robot) return;

          cache.modify({
            fields: {
              robotsByAccount(
                existingRefs: readonly Reference[] = [],
                { readField, toReference }: ModifierDetails,
              ) {
                const newRef = toReference({
                  __typename: 'Robot',
                  id: robot.id,
                });
                if (!newRef) return existingRefs;

                const exists = existingRefs.some((ref) => readField('id', ref) === robot.id);

                if (exists) {
                  return existingRefs.map((ref) =>
                    readField('id', ref) === robot.id ? newRef : ref,
                  );
                }

                return [...existingRefs, newRef];
              },
            },
          });
        },
      }),
    );
  }
}
