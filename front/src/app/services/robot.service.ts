import { inject, Injectable, signal, Signal } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom, map } from 'rxjs';
import { Robot, RobotInput } from '@app/core/models/robot';
import { DELETE_ROBOT, GET_ROBOTS_BY_ACCOUNT, UPSERT_ROBOT } from './robot.graphql';
import { ApolloCache } from '@apollo/client';

@Injectable({ providedIn: 'root' })
export class RobotService {
  private apollo = inject(Apollo);

  robotsByAccount(accountId: string | undefined): Signal<Robot[]> {
    if (!accountId) return signal([]);

    return toSignal(
      this.apollo
        .watchQuery<{ robotsByAccount: Robot[] }>({
          query: GET_ROBOTS_BY_ACCOUNT,
          variables: { accountId },
          fetchPolicy: 'cache-and-network',
        })
        .valueChanges.pipe(map((result) => result.data?.robotsByAccount ?? [])),
      {
        initialValue: [],
      },
    ) as Signal<Robot[]>;
  }

  async deleteRobot(robot: Robot) {
    await firstValueFrom(
      this.apollo.mutate<{ deleteRobot: string }>({
        mutation: DELETE_ROBOT,
        variables: { id: robot.id },

        update: (cache, { data }) => {
          const deletedId = data?.deleteRobot;
          if (!deletedId) return;
          this.updateCachedRobots(cache, robot.accountId, (robots) =>
            robots.filter((robot) => robot.id !== deletedId),
          );
        },
      }),
    );
  }

  async upsertRobot(accountId: string, input: RobotInput) {
    await firstValueFrom(
      this.apollo.mutate<{ upsertRobot: Robot }>({
        mutation: UPSERT_ROBOT,
        variables: { input },

        update: (cache, { data }) => {
          const robot = data?.upsertRobot;
          if (!robot) return;
          this.updateCachedRobots(cache, accountId, (robots) => {
            const index = robots.findIndex((x) => x.id === robot.id);
            if (index === -1) return [...robots, robot];
            const copy = [...robots];
            copy[index] = robot;
            return copy;
          });
        },
      }),
    );
  }

  private updateCachedRobots(
    cache: ApolloCache,
    accountId: string,
    updateFn: (robots: Robot[]) => Robot[],
  ): void {
    const existing = cache.readQuery<{ robotsByAccount: Robot[] }>({
      query: GET_ROBOTS_BY_ACCOUNT,
      variables: { accountId },
    });
    cache.writeQuery({
      query: GET_ROBOTS_BY_ACCOUNT,
      variables: { accountId },
      data: { robotsByAccount: updateFn(existing?.robotsByAccount ?? []) },
    });
  }
}
