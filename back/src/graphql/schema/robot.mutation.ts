export default /* GraphQL */ `
  input InsertRobotInput {
    accountId: ID!
    expert: ExpertAdvisor!
    timeframe: Timeframe!
    symbol: Symbol!
  }

  input UpdateRobotInput {
    id: ID!
    status: RobotStatus!
    parameterSetId: ID
  }

  input ExpertDistributionInput {
    expert: ExpertAdvisor!
    count: Int!
  }

  input DiversifyRobotsInput {
    accountId: ID!
    timeframes: [Timeframe!]!
    symbols: [Symbol!]!
    distribution: [ExpertDistributionInput!]!
  }

  extend type Mutation {
    deleteRobot(id: ID!): Boolean!
    insertRobot(input: InsertRobotInput!): Robot!
    updateRobot(input: UpdateRobotInput!): Robot!
    diversifyRobots(input: DiversifyRobotsInput!): [Robot!]!
  }
`;
