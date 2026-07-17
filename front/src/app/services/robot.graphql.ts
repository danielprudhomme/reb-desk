import { gql } from 'apollo-angular';

const ROBOT_FIELDS = `
  id
  accountId
  status
  expert
  symbol
  timeframe
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

export const INSERT_ROBOT = gql`
  mutation InsertRobot($input: InsertRobotInput!) {
    insertRobot(input: $input) {
      ${ROBOT_FIELDS}
    }
  }
`;

export const UPDATE_ROBOT = gql`
  mutation UpdateRobot($input: UpdateRobotInput!) {
    updateRobot(input: $input) {
      ${ROBOT_FIELDS}
    }
  }
`;

export const DELETE_ROBOT = gql`
  mutation DeleteRobot($id: ID!) {
    deleteRobot(id: $id)
  }
`;

export const DIVERSIFY_ROBOTS = gql`
  mutation DiversifyRobots($input: DiversifyRobotsInput!) {
    diversifyRobots(input: $input) {
      ${ROBOT_FIELDS}
    }
  }
`;
