import { gql } from 'apollo-angular';

const ROBOT_FIELDS = `
  id
  accountId
  status
  strategyContext {
    expert
    symbol
    timeframe
    leverage
    capital
  }
  parameterSet {
    id
    parameters {
      name
      value
    }
  }
`;

export const GET_ROBOTS_BY_ACCOUNT = gql`
  query RobotsByAccount($accountId: ID!) {
    robotsByAccount(accountId: $accountId) {
      ${ROBOT_FIELDS}
    }
  }
`;

export const CREATE_DRAFT_ROBOTS = gql`
  mutation CreateDraftRobots($accountId: ID!, $inputs: [CreateDraftRobotInput!]!) {
    createDraftRobots(accountId: $accountId, inputs: $inputs) {
      ${ROBOT_FIELDS}
    }
  }
`;

export const UPSERT_ROBOT = gql`
  mutation UpsertRobot($input: RobotInput!) {
    upsertRobot(input: $input) {
      ${ROBOT_FIELDS}
    }
  }
`;

export const DELETE_ROBOT = gql`
  mutation DeleteRobot($id: ID!) {
    deleteRobot(id: $id)
  }
`;
