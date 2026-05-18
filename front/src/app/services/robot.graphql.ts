import { gql } from 'apollo-angular';

export const GET_ROBOTS_BY_ACCOUNT = gql`
  query RobotsByAccount($accountId: ID!) {
    robotsByAccount(accountId: $accountId) {
      id

      expert
      timeframe
      symbol

      status

      parameters {
        key
        value
      }
    }
  }
`;

export const UPSERT_ROBOT = gql`
  mutation UpsertRobot($input: RobotInput!) {
    upsertRobot(input: $input) {
      id

      expert
      timeframe
      symbol

      status

      strategySignature

      parameters {
        key
        value
      }
    }
  }
`;

export const DELETE_ROBOT = gql`
  mutation DeleteRobot($id: ID!) {
    deleteRobot(id: $id)
  }
`;
