export default /* GraphQL */ `
  type Robot {
    id: ID!

    accountId: ID!

    status: RobotStatus!

    strategyContext: StrategyContext!

    parameterSetId: ID

    parameterSet: ParameterSet
  }

  extend type Query {
    robotsByAccount(accountId: ID!): [Robot!]!
  }
`;
