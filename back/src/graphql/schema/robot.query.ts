export default /* GraphQL */ `
  type Robot {
    id: ID!

    accountId: ID!

    status: RobotStatus!

    expert: ExpertAdvisor!

    timeframe: Timeframe!

    symbol: Symbol!

    parameterSet: ParameterSet
  }

  extend type Query {
    robotsByAccount(accountId: ID!): [Robot!]!
  }
`;
