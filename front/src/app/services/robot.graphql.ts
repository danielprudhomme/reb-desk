import { gql } from 'apollo-angular';

export const GET_ROBOTS_BY_ACCOUNT = gql`
  query RobotsByAccount($accountId: ID!) {
    robotsByAccount(accountId: $accountId) {
      id
      accountId

      expert
      timeframe
      symbol

      status

      parameters {
        name
        value
      }
    }
  }
`;

export const CREATE_DRAFT_ROBOTS = gql`
  mutation CreateDraftRobots($accountId: ID!, $inputs: [CreateDraftRobotInput!]!) {
    createDraftRobots(accountId: $accountId, inputs: $inputs) {
      id
      accountId
      expert
      timeframe
      symbol
      status
      parameters {
        name
        value
      }
    }
  }
`;

export const UPSERT_ROBOT = gql`
  mutation UpsertRobot($input: RobotInput!) {
    upsertRobot(input: $input) {
      id
      accountId

      expert
      timeframe
      symbol

      status

      strategySignature

      parameters {
        name
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
