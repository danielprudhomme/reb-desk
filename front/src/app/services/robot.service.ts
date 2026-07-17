/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { inject, Injectable, signal, Signal } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom, map } from 'rxjs';
import { Reference } from '@apollo/client';
import { RobotConfiguration } from '@shared/models/robot-configuration';
import { Robot } from '@shared/models/robot';
import {
  DELETE_ROBOT,
  DIVERSIFY_ROBOTS,
  GET_ROBOTS_BY_ACCOUNT,
  INSERT_ROBOT,
  UPDATE_ROBOT,
} from './robot.graphql';
import { symbols } from '@shared/models/symbol';
import { ExpertDistribution } from '@shared/models/expert-distribution';

@Injectable({ providedIn: 'root' })
export class RobotService {
  private apollo = inject(Apollo);

  robotsByAccount: Signal<Robot[]> = signal([]);

  // ---------------------------
  // QUERY
  // ---------------------------
  setAccountId(accountId: string) {
    const robots$ = this.apollo
      .watchQuery<{ robotsByAccount: Robot[] }>({
        query: GET_ROBOTS_BY_ACCOUNT,
        variables: { accountId },
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        notifyOnNetworkStatusChange: true,
      })
      .valueChanges.pipe(map((result) => result.data?.robotsByAccount ?? []));

    this.robotsByAccount = toSignal(robots$, { initialValue: [] }) as Signal<Robot[]>;
  }

  // ---------------------------
  // DELETE
  // ---------------------------
  async deleteRobot(robot: Robot) {
    await firstValueFrom(
      this.apollo.mutate<{ deleteRobot: boolean }>({
        mutation: DELETE_ROBOT,
        variables: { id: robot.id },
        update: (cache, { data }) => {
          if (!data?.deleteRobot) return;

          cache.modify({
            fields: {
              robotsByAccount(existingRefs: readonly Reference[] = [], { readField }) {
                return existingRefs.filter((ref) => readField('id', ref) !== robot.id);
              },
            },
          });

          cache.evict({
            id: cache.identify({ __typename: 'Robot', id: robot.id }),
          });

          cache.gc();
        },
      }),
    );
  }

  async insertRobot(accountId: string, input: RobotConfiguration) {
    const { __typename, ...cleanInput } = input as any;

    await firstValueFrom(
      this.apollo.mutate<{ insertRobot: Robot }>({
        mutation: INSERT_ROBOT,
        variables: {
          input: {
            ...cleanInput,
            accountId,
          },
        },

        update: (cache, { data }) => {
          const robot = data?.insertRobot;
          if (!robot) return;

          cache.modify({
            fields: {
              robotsByAccount(existingRefs: readonly Reference[] = [], { toReference, readField }) {
                const newRef = toReference({
                  __typename: 'Robot',
                  id: robot.id,
                });

                if (!newRef) {
                  return existingRefs;
                }

                const filteredRefs = existingRefs.filter(
                  (ref) => readField('id', ref) !== robot.id,
                );

                return [...filteredRefs, newRef];
              },
            },
          });
        },
      }),
    );
  }

  // ---------------------------
  // UPDATE
  // ---------------------------
  async updateRobot(robot: Robot) {
    const input = { id: robot.id, status: robot.status, parameterSetId: robot.parameterSetId };
    await firstValueFrom(
      this.apollo.mutate<{ updateRobot: Robot }>({
        mutation: UPDATE_ROBOT,
        variables: { input },
      }),
    );
  }

  async diversifyRobots(accountId: string, distribution: ExpertDistribution) {
    const selectedSymbols = symbols.filter((symbol) => symbol !== 'XAUUSD');

    const input = {
      accountId,
      timeframes: ['M15', 'M20', 'M30', 'H1'],
      symbols: selectedSymbols,
      distribution,
    };
    await firstValueFrom(
      this.apollo.mutate<{ diversifyRobots: Robot[] }>({
        mutation: DIVERSIFY_ROBOTS,
        variables: { input },
      }),
    );
  }
}
