/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { inject, Injectable, signal, Signal } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom, map } from 'rxjs';
import { Reference } from '@apollo/client';

import { Robot, RobotInput } from '@app/core/models/robot';
import { RobotConfiguration } from '@shared/models/robot-configuration';

import {
  CREATE_DRAFT_ROBOTS,
  DELETE_ROBOT,
  GET_ROBOTS_BY_ACCOUNT,
  UPSERT_ROBOT,
} from './robot.graphql';

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

  // ---------------------------
  // BULK CREATE (draft robots)
  // ---------------------------
  async createDraftRobots(accountId: string, inputs: RobotConfiguration[]) {
    const cleanInputs = (inputs as any[]).map(({ __typename, ...input }: any) => ({
      ...input,
    }));

    await firstValueFrom(
      this.apollo.mutate<{ createDraftRobots: Robot[] }>({
        mutation: CREATE_DRAFT_ROBOTS,
        variables: {
          accountId,
          inputs: cleanInputs,
        },

        update: (cache, { data }) => {
          const robots = data?.createDraftRobots;
          if (!robots?.length) return;

          cache.modify({
            fields: {
              robotsByAccount(existingRefs: readonly Reference[] = [], { readField, toReference }) {
                // Remove existing draft robots
                const filteredRefs = existingRefs.filter(
                  (ref) => readField('status', ref) !== 'draft',
                );

                // Add newly created draft robots
                const newRefs = robots
                  .map((robot) => toReference({ __typename: 'Robot', id: robot.id }))
                  .filter((ref): ref is Reference => ref !== null && ref !== undefined);

                return [...filteredRefs, ...newRefs];
              },
            },
          });
        },
      }),
    );
  }

  // ---------------------------
  // UPSERT
  // ---------------------------
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
              robotsByAccount(existingRefs: readonly Reference[] = [], { toReference, readField }) {
                const newRef = toReference({
                  __typename: 'Robot',
                  id: robot.id,
                })!;

                const filtered = existingRefs.filter((r) => readField('id', r) !== robot.id);

                return [...filtered, newRef];
              },
            },
          });
        },
      }),
    );
  }
}
