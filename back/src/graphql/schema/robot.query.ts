export default /* GraphQL */ `
  type Robot {
    id: ID!
    accountId: ID!

    expert: ExpertAdvisor!
    timeframe: Timeframe!
    symbol: Symbol!

    status: RobotStatus!

    strategySignature: String!

    parameters: [Parameter!]!
  }

  extend type Query {
    robotsByAccount(accountId: ID!): [Robot!]!
  }
`;
